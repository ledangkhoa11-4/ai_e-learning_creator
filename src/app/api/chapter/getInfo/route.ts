// /api/chapter/getInfo
import { prisma } from "@/lib/db";
import { strict_output } from "@/lib/gpt";
import { getQuestionsFromTranscript, getTranscript, searchYoutube } from "@/lib/youtube";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodyParser = z.object({
  chapterId: z.string(),
});

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const { chapterId } = bodyParser.parse(body);
    const chapter = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
      },
    });
    if (!chapter) {
      return NextResponse.json(
        {
          success: false,
          error: "Chapter not found",
        },
        { status: 404 }
      );
    }
    const unit = await prisma.unit.findUnique({
      where: {
        id: chapter.unitId,
      },
    });
    if (!unit) {
      return NextResponse.json(
        {
          success: false,
          error: "Unit not found",
        },
        { status: 404 }
      );
    }
    const course = await prisma.course.findUnique({
      where: {
        id: unit.courseId,
      },
    });
    if (!course) {
      return NextResponse.json(
        {
          success: false,
          error: "Course not found",
        },
        { status: 404 }
      );
    }
    const videoId = await searchYoutube(chapter.youtubeSearchQuery);
    let transcript = await getTranscript(videoId);
    let maxLength = 500;
    transcript = transcript.split(" ").slice(0, maxLength).join(" ");
    const { summary }: { summary: string } = videoId
      ? await strict_output(
          "You are an AI capable of summarizing a youtube transcript",
          "summarize in 250 words or less and do not talk of the sponsors or anything unrelated to the main topic, also do not introduce what the summary is about.\n" +
            transcript,
          { summary: "summary of the transcript" }
        )
      : await strict_output(
          "You are an AI capable of summarizing a knowledge of the chapter content",
          "summarize in 250 words or less and do not talk of the sponsors or anything unrelated to the main topic, also do not introduce what the summary is about.\n" +
            chapter.name,
          { summary: "summary of the content of chapter" }
        );
    const { content }: { content: string } = await strict_output(
      "You are an AI capable of extracting content of a whole course content",
      `Extracting content in 300 words or less related to the topic "${unit.name}" or "${chapter.name} from \n` + course.material,
      { content: "content extracted from main content" }
    );

    const questions = await getQuestionsFromTranscript(transcript, chapter.name);
    await prisma.question.createMany({
      data: questions.map((question) => {
        let options = [question.answer, question.option1, question.option2, question.option3];
        options = options.sort(() => Math.random() - 0.5);
        return {
          question: question.question,
          answer: question.answer,
          options: JSON.stringify(options),
          chapterId: chapterId,
        };
      }),
    });
    await prisma.chapter.update({
      where: {
        id: chapterId,
      },
      data: {
        videoId: videoId,
        summary: summary,
        content: content,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid body",
        },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: error,
        },
        { status: 500 }
      );
    }
  }
}
