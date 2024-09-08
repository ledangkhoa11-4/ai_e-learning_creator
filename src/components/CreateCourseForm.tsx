"use client";
import React, { useState, useCallback } from "react";
import { Form, FormField, FormItem, FormLabel, FormControl } from "./ui/form";
import { createChaptersSchema } from "@/validators/course";
import { z } from "zod";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Plus, Trash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import Dropzone from "react-dropzone";

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_FILE_TYPES = ["application/pdf"];

type Props = {};

type Input = z.infer<typeof createChaptersSchema>;

const CreateCourseForm = (props: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const [document, setDocument] = useState<null | File>(null);
  const { mutate: createChapters, isLoading } = useMutation({
    mutationFn: async ({ title, units, document }: Input) => {
      const response = await axios.post("/api/course/createChapters", { title, units, document });
      return response.data;
    },
  });
  const form = useForm<Input>({
    resolver: zodResolver(createChaptersSchema),
    defaultValues: {
      title: "",
      units: ["", "", ""],
    },
  });

  async function onSubmit(data: Input) {
    const finalData = { ...data };
    if (data.units.some((unit) => unit === "")) {
      toast({
        title: "error",
        description: "please fill all the units",
        variant: "destructive",
      });
      return;
    }
    if (document == null) {
      toast({
        title: "error",
        description: "please enclosed the document",
        variant: "destructive",
      });
      return;
    }
    const arrayBuffer = await document.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    finalData.document = buffer;

    createChapters(finalData, {
      onSuccess: ({ course_id }) => {
        toast({
          title: "success",
          description: "course created successfully",
        });
        router.push(`/create/${course_id}`);
      },
      onError: (error) => {
        console.error(error);
        toast({
          title: "Error",
          description: "Something went wrong",
          variant: "destructive",
        });
      },
    });
  }
  form.watch();

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mt-4">
          <Dropzone
            maxFiles={1}
            accept={{
              "application/pdf": [".pdf"],
            }}
            onDrop={(acceptedFiles) => {
              if (acceptedFiles.length > 0) {
                if (acceptedFiles[0].size > MAX_FILE_SIZE) {
                  toast({
                    title: "Error",
                    description: "Max file size is 5MB",
                    variant: "destructive",
                  });
                  return;
                }
                if (!ACCEPTED_FILE_TYPES.includes(acceptedFiles[0].type)) {
                  toast({
                    title: "Error",
                    description: "Only pdf file is supported",
                    variant: "destructive",
                  });
                  return;
                }
                setDocument(acceptedFiles[0]);
              }
            }}
          >
            {({ getRootProps, getInputProps }) => (
              <section className="bg-secondary cursor-pointer p-6 mb-3" {...getRootProps()}>
                <div>
                  <input {...getInputProps()} />
                  <p>Document: {document === null ? "Drag and drop material here, or click to select file" : document.name}</p>
                </div>
              </section>
            )}
          </Dropzone>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => {
              return (
                <FormItem className="flex flex-col items-start w-full sm:items-center flex-row">
                  <FormLabel className="flex-[1] text-xl">Title</FormLabel>
                  <FormControl className="flex-[6]">
                    <Input placeholder="Enter the main topic of the course" {...field} />
                  </FormControl>
                </FormItem>
              );
            }}
          />
          <AnimatePresence>
            {form.watch("units").map((_, index) => {
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{
                    opacity: { duration: 0.2 },
                    height: { duration: 0.2 },
                  }}
                >
                  <FormField
                    key={index}
                    control={form.control}
                    name={`units.${index}`}
                    render={({ field }) => {
                      return (
                        <FormItem className="flex flex-col items-start w-full sm:items-center sm:flex-row">
                          <FormLabel className="flex-[1] text-xl">Unit {index + 1}</FormLabel>
                          <FormControl className="flex-[6]">
                            <Input placeholder="Enter subtopic of the course" {...field} />
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div className="flex items-center justify-center mt-4">
            <Separator className="flex-[1]" />
            <div className="mx-4">
              <Button
                type="button"
                variant="secondary"
                className="font-semibold"
                onClick={() => {
                  form.setValue("units", [...form.watch("units"), ""]);
                }}
              >
                Add Unit
                <Plus className="w-4 h-4 ml-2 text-green-500" />
              </Button>

              <Button
                type="button"
                variant="secondary"
                className="font-semibold ml-2"
                onClick={() => {
                  form.setValue("units", form.watch("units").slice(0, -1));
                }}
              >
                Remove Unit
                <Trash className="w-4 h-4 ml-2 text-red-500" />
              </Button>
            </div>
            <Separator className="flex-[1]" />
          </div>
          <Button disabled={isLoading} type="submit" className="w-full mt-6" size="lg">
            Generate Course !
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateCourseForm;
