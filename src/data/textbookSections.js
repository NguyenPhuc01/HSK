import { getTracksForLesson } from './audioManifest'

/**
 * Mục lục đầy đủ giáo trình HSK Standard Course 1 (143 trang)
 * Audio chỉ gắn vào các bài có file MP3 — phần khác vẫn xem PDF bình thường
 */
export const textbookSections = [
  {
    id: 'cover',
    group: 'intro',
    title: 'Bìa sách',
    titleZh: '封面',
    startPage: 1,
    endPage: 2,
  },
  {
    id: 'preface',
    group: 'intro',
    title: 'Lời nói đầu',
    titleZh: '前言',
    startPage: 3,
    endPage: 4,
  },
  {
    id: 'guide',
    group: 'intro',
    title: 'Hướng dẫn sử dụng',
    titleZh: '使用说明',
    startPage: 5,
    endPage: 6,
    extraAudio: [{ file: '00 HSK标准教程1--片头.mp3', trackLabel: '00' }],
  },
  {
    id: 'lesson-1',
    group: 'lessons',
    lessonId: 1,
    title: '你好',
    startPage: 7,
    endPage: 12,
  },
  {
    id: 'lesson-2',
    group: 'lessons',
    lessonId: 2,
    title: '谢谢你',
    startPage: 13,
    endPage: 18,
  },
  {
    id: 'lesson-3',
    group: 'lessons',
    lessonId: 3,
    title: '你叫什么名字',
    startPage: 19,
    endPage: 24,
  },
  {
    id: 'lesson-4',
    group: 'lessons',
    lessonId: 4,
    title: '她是我的汉语老师',
    startPage: 25,
    endPage: 30,
  },
  {
    id: 'lesson-5',
    group: 'lessons',
    lessonId: 5,
    title: '她女儿今年二十岁',
    startPage: 31,
    endPage: 36,
  },
  {
    id: 'lesson-6',
    group: 'lessons',
    lessonId: 6,
    title: '我会说汉语',
    startPage: 37,
    endPage: 42,
  },
  {
    id: 'lesson-7',
    group: 'lessons',
    lessonId: 7,
    title: '今天几号',
    startPage: 43,
    endPage: 48,
  },
  {
    id: 'lesson-8',
    group: 'lessons',
    lessonId: 8,
    title: '我想喝茶',
    startPage: 49,
    endPage: 54,
  },
  {
    id: 'lesson-9',
    group: 'lessons',
    lessonId: 9,
    title: '你在哪儿',
    startPage: 55,
    endPage: 60,
  },
  {
    id: 'lesson-10',
    group: 'lessons',
    lessonId: 10,
    title: '我能坐这儿吗',
    startPage: 61,
    endPage: 66,
  },
  {
    id: 'lesson-11',
    group: 'lessons',
    lessonId: 11,
    title: '现在几点',
    startPage: 67,
    endPage: 72,
  },
  {
    id: 'lesson-12',
    group: 'lessons',
    lessonId: 12,
    title: '明天天气怎么样',
    startPage: 73,
    endPage: 78,
  },
  {
    id: 'lesson-13',
    group: 'lessons',
    lessonId: 13,
    title: '他在学做中国菜',
    startPage: 79,
    endPage: 84,
  },
  {
    id: 'lesson-14',
    group: 'lessons',
    lessonId: 14,
    title: '她买了不少衣服',
    startPage: 85,
    endPage: 90,
  },
  {
    id: 'lesson-15',
    group: 'lessons',
    lessonId: 15,
    title: '我是坐飞机来的',
    startPage: 91,
    endPage: 96,
  },
  {
    id: 'vocabulary',
    group: 'appendix',
    title: 'Bảng từ vựng',
    titleZh: '词语表',
    startPage: 97,
    endPage: 115,
  },
  {
    id: 'characters',
    group: 'appendix',
    title: 'Bảng chữ Hán',
    titleZh: '汉字索引',
    startPage: 116,
    endPage: 130,
  },
  {
    id: 'answers',
    group: 'appendix',
    title: 'Đáp án bài tập',
    titleZh: '练习参考答案',
    startPage: 131,
    endPage: 143,
  },
]

export const sectionGroups = {
  intro: { label: 'Giới thiệu', labelZh: '前言' },
  lessons: { label: '15 Bài học', labelZh: '课文' },
  appendix: { label: 'Phụ lục', labelZh: '附录' },
}

export const TOTAL_PAGES = 143

export function getSection(id) {
  return textbookSections.find((s) => s.id === id)
}

export function getSectionByPage(page) {
  return textbookSections.find((s) => page >= s.startPage && page <= s.endPage)
}

function buildTrack(sectionId, file, trackLabel) {
  return {
    id: `${sectionId}-${trackLabel}`,
    audio: file,
    trackLabel,
    label: trackLabel,
    type: 'audio',
  }
}

export function getAudioTracksForSection(section) {
  if (!section) return []

  const tracks = []

  if (section.extraAudio) {
    for (const { file, trackLabel } of section.extraAudio) {
      tracks.push(buildTrack(section.id, file, trackLabel))
    }
  }

  if (section.lessonId) {
    const lessonTracks = getTracksForLesson(section.lessonId).map(({ file }) => {
      const trackLabel = file.replace('.mp3', '')
      return buildTrack(section.id, file, trackLabel)
    })
    tracks.push(...lessonTracks)
  }

  return tracks
}

export function getSectionsByGroup(group) {
  return textbookSections.filter((s) => s.group === group)
}
