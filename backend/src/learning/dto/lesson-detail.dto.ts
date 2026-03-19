import { ApiProperty } from '@nestjs/swagger';

class LessonRuntimeDto {
  @ApiProperty({ example: 'ls' })
  expectedCommand: string;

  @ApiProperty({ example: '/home/student/training_zone', required: false })
  expectedCwd?: string;

  @ApiProperty({ example: '3 rsschool_journey.txt', required: false })
  sampleOutput?: string;
}

export class LessonDetailDto {
  @ApiProperty({ example: 'ls-home' })
  id: string;

  @ApiProperty({ example: 'cmd-basics' })
  moduleId: string;

  @ApiProperty({ example: 'ls-home' })
  slug: string;

  @ApiProperty({ example: 'List home directory' })
  title: string;

  @ApiProperty({ example: 1 })
  order: number;

  @ApiProperty({
    example:
      'The `ls` command prints files and folders in the current directory. By default you start in the home directory.',
  })
  theoryMarkdown: string;

  @ApiProperty({ example: 'Print the list of files in your home directory.' })
  taskDescription: string;

  @ApiProperty({
    type: [String],
    required: false,
    example: ['Try `ls` first if you are not sure the file exists.'],
  })
  hints?: string[];

  @ApiProperty({ type: LessonRuntimeDto, required: false })
  runtime?: LessonRuntimeDto;
}
