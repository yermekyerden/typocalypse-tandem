export type LessonStatus = 'locked' | 'active' | 'completed';

export type Lesson = {
  id: string;
  title: string;
  order: number;
  status: LessonStatus;
  theory: string;
  task: string;
  expectedCommand: string;
  sampleOutput?: string;
};

export type Module = {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
};

export const modules: Module[] = [
  {
    id: 'cmd-basics',
    title: 'Основы командной строки',
    description:
      'Навигация по каталогам, просмотр содержимого, чтение файлов, первые шаги с cd/ls/pwd.',
    order: 1,
    lessons: [
      {
        id: 'ls-home',
        title: 'Шаг 1 — Просмотр содержимого директории',
        order: 1,
        status: 'active',
        theory:
          'Команда ls выводит список файлов и папок в текущей директории. По умолчанию вы находитесь в домашней директории.',
        task: 'Выведите список файлов в вашей домашней директории.',
        expectedCommand: 'ls',
      },
      {
        id: 'cat-mission',
        title: 'Шаг 2 — Чтение файла mission.txt',
        order: 2,
        status: 'locked',
        theory: 'Команда cat используется для просмотра содержимого файла.',
        task: 'Выведите содержимое файла mission.txt.',
        expectedCommand: 'cat mission.txt',
      },
      {
        id: 'ls-hidden',
        title: 'Шаг 3 — Скрытые файлы (ls -a)',
        order: 3,
        status: 'locked',
        theory:
          'В Linux файлы, начинающиеся с точки (.), скрыты по умолчанию. Для отображения всех файлов используется ls -a.',
        task: 'Выведите список всех файлов, включая скрытые.',
        expectedCommand: 'ls -a',
      },
      {
        id: 'cat-hidden',
        title: 'Шаг 4 — Чтение скрытого файла .secret_note',
        order: 4,
        status: 'locked',
        theory: 'Скрытый файл можно открыть так же, как обычный.',
        task: 'Отобразите содержимое файла .secret_note.',
        expectedCommand: 'cat .secret_note',
      },
      {
        id: 'pwd',
        title: 'Шаг 5 — Определение текущей директории',
        order: 5,
        status: 'locked',
        theory: 'Команда pwd показывает текущий путь в файловой системе.',
        task: 'Определите, в какой директории вы сейчас находитесь.',
        expectedCommand: 'pwd',
      },
      {
        id: 'cd-training',
        title: 'Шаг 6 — Переход в training_zone',
        order: 6,
        status: 'locked',
        theory: 'Команда cd используется для перемещения по файловой системе.',
        task: 'Перейдите в директорию training_zone.',
        expectedCommand: 'cd training_zone',
      },
      {
        id: 'cat-history',
        title: 'Шаг 7 — Чтение history.txt',
        order: 7,
        status: 'locked',
        theory:
          'В директории training_zone находится файл history.txt с фактом об истории Unix.',
        task: 'Отобразите содержимое файла history.txt.',
        expectedCommand: 'cat history.txt',
      },
      {
        id: 'mkdir-practice',
        title: 'Шаг 8 — Создание директории practice_arena',
        order: 8,
        status: 'locked',
        theory: 'Команда mkdir создаёт новую директорию.',
        task: 'Создайте директорию practice_arena, затем перейдите в неё.',
        expectedCommand: 'mkdir practice_arena && cd practice_arena',
      },
      {
        id: 'touch-first-task',
        title: 'Шаг 9 — Создание файла first_task.txt',
        order: 9,
        status: 'locked',
        theory: 'Команда touch создаёт пустой файл, если он не существует.',
        task: 'Находясь в practice_arena, создайте файл first_task.txt и убедитесь, что он появился.',
        expectedCommand: 'touch first_task.txt',
      },
    ],
  },
  {
    id: 'fs-basics',
    title: 'Файловая система',
    description:
      'Абсолютные и относительные пути, перемещение между уровнями, чтение файлов в разных каталогах.',
    order: 2,
    lessons: [
      {
        id: 'cd-abs',
        title: 'Шаг 1 — Абсолютный путь',
        order: 1,
        status: 'active',
        theory:
          'Абсолютный путь всегда начинается с / и указывает полный маршрут от корня файловой системы.',
        task: 'Перейдите в каталог /var/tmp/rsschool, используя абсолютный путь.',
        expectedCommand: 'cd /var/tmp/rsschool',
      },
      {
        id: 'cd-rel',
        title: 'Шаг 2 — Работа внутри каталога',
        order: 2,
        status: 'locked',
        theory: 'Содержимое текущего каталога выводится командой ls.',
        task: 'Отобразите содержимое каталога /var/tmp/rsschool.',
        expectedCommand: 'ls',
      },
      {
        id: 'archive-read',
        title: 'Шаг 3 — Относительный путь в stage1',
        order: 3,
        status: 'locked',
        theory: 'Относительный путь строится от текущего каталога и не начинается с /.',
        task:
          'Перейдите в каталог stage1, используя относительный путь, затем отобразите содержимое intro.txt.',
        expectedCommand: 'cd stage1 && cat intro.txt',
      },
      {
        id: 'cd-up',
        title: 'Шаг 4 — Переход на уровень выше',
        order: 4,
        status: 'locked',
        theory: '.. обозначает родительский каталог.',
        task: 'Вернитесь из stage1 на уровень выше.',
        expectedCommand: 'cd ..',
      },
      {
        id: 'cd-multi-up',
        title: 'Шаг 5 — Переход через несколько уровней',
        order: 5,
        status: 'locked',
        theory: 'Несколько ../ подряд позволяют подняться на несколько уровней.',
        task:
          'Находясь в /var/tmp/rsschool/stage2, перейдите в /var/tmp, используя относительный путь.',
        expectedCommand: 'cd ../../',
      },
      {
        id: 'archive-history',
        title: 'Шаг 6 — Работа с архивом',
        order: 6,
        status: 'locked',
        theory: 'Комбинация относительных путей для перехода к файлам архива.',
        task: 'Перейдите в rsschool/archive и отобразите файл history.txt.',
        expectedCommand: 'cd rsschool/archive && cat history.txt',
      },
    ],
  },
  {
    id: 'permissions',
    title: 'Права доступа',
    description: 'Чтение и изменение прав, chmod в символической и числовой формах.',
    order: 3,
    lessons: [
      {
        id: 'ls-perms',
        title: 'Шаг 1 — Определение владельца файла',
        order: 1,
        status: 'active',
        theory:
          'Команда ls -l показывает права, ссылки, владельца и группу. Важно читать столбцы: права, ссылки, владелец, группа, размер, дата, имя.',
        task: 'Определите владельца файла rsstage1.txt в каталоге permissions_lab.',
        expectedCommand: 'ls -l',
      },
      {
        id: 'chmod-owner',
        title: 'Шаг 2 — Попытка чтения файла',
        order: 2,
        status: 'locked',
        theory: 'Если у файла нет прав на чтение для вас, попытка cat приведёт к Permission denied.',
        task: 'Попробуйте прочитать rsstage1.txt и зафиксируйте отсутствие прав.',
        expectedCommand: 'cat rsstage1.txt',
      },
      {
        id: 'cat-protected',
        title: 'Шаг 3 — Изменение прав доступа',
        order: 3,
        status: 'locked',
        theory:
          'Права задаются тремя триадами (owner/group/other). Числовая форма: r=4, w=2, x=1. 6=rw, 0=---.',
        task: 'Дайте владельцу права на чтение и запись, убрав права у остальных для rsstage1.txt.',
        expectedCommand: 'chmod 600 rsstage1.txt',
      },
      {
        id: 'ls-check',
        title: 'Шаг 4 — Проверка изменений',
        order: 4,
        status: 'locked',
        theory: 'После изменения прав проверяйте ls -l, чтобы убедиться в корректности битов.',
        task: 'Проверьте права rsstage1.txt после chmod 600.',
        expectedCommand: 'ls -l rsstage1.txt',
      },
      {
        id: 'cat-after',
        title: 'Шаг 5 — Повторное чтение файла',
        order: 5,
        status: 'locked',
        theory: 'После выдачи rw для владельца чтение файла должно работать.',
        task: 'Прочитайте rsstage1.txt теперь, когда права обновлены.',
        expectedCommand: 'cat rsstage1.txt',
      },
    ],
  },
];
