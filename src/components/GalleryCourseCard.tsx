import { Chapter, Course, Unit } from '@prisma/client'
import Link from 'next/link'
import Image from 'next/image'


import React from 'react'

type Props = {
    course:Course&{
        units:(Unit&{
            chapters:Chapter[]
        })[]
    }
}

const GalleryCourseCard = async ({course}: Props) => {
  return (
    <>
    <div className='w-full h-full border rounded-lg border-secondary'>
        <div className='relative'>
            <Link href={`/course/${course.id}/0/0`} className="relative block w-fit">
                <Image src={course.image|| ""} className="object-cover max-h-[200px] rounded-t-lg"
                width={300}
                height={300}
                alt="picture of the course"
                />
                <span className='absolute px-2 py-1 text-white rounded-md bg-black/60 w-fit bottom-2 left-2 right-2'>
                    {course.name}
                </span>
            </Link>
        </div>
        <div className='p-4'/>
        <h4 className="px-3 text-sm text-secondary-foreground/60">
        Units
        </h4>
        <div className='space-y-1 px-3 mb-3'>
            {course.units.map((unit,unitIndex)=>{
                return(
                    <Link href={`/course/${course.id}/${unitIndex}/0`} 
                    key={unit.id} 
                    className='block underline w-fit'>
                    {unit.name}
                    </Link>
                )
            })}
        </div>
        
    </div>
    </>
  )
}

export default GalleryCourseCard