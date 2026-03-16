import { ApiProperty } from '@nestjs/swagger';

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
}
