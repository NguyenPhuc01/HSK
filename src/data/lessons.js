import { lesson1 } from './lesson1'
import { getTracksForLesson } from './audioManifest'

function buildAutoSections(lessonId) {
  return getTracksForLesson(lessonId).map(({ file }) => {
    const trackLabel = file.replace('.mp3', '')
    return {
      id: `lesson${lessonId}-${trackLabel}`,
      audio: file,
      trackLabel,
      label: `Audio ${trackLabel}`,
      type: 'text',
      content: [`Nội dung bài ${lessonId} — track ${trackLabel}. Bạn có thể bổ sung nội dung giáo trình vào file data.`],
    }
  })
}

export const lessons = [
  { id: 1, title: '你好', slug: 'lesson-1', sections: lesson1.sections },
  { id: 2, title: '谢谢你', slug: 'lesson-2', sections: buildAutoSections(2) },
  { id: 3, title: '你叫什么名字', slug: 'lesson-3', sections: buildAutoSections(3) },
  { id: 4, title: '她是我的汉语老师', slug: 'lesson-4', sections: buildAutoSections(4) },
  { id: 5, title: '她女儿今年二十岁', slug: 'lesson-5', sections: buildAutoSections(5) },
  { id: 6, title: '我会说汉语', slug: 'lesson-6', sections: buildAutoSections(6) },
  { id: 7, title: '今天几号', slug: 'lesson-7', sections: buildAutoSections(7) },
  { id: 8, title: '我想喝茶', slug: 'lesson-8', sections: buildAutoSections(8) },
  { id: 9, title: '你在哪儿', slug: 'lesson-9', sections: buildAutoSections(9) },
  { id: 10, title: '我能坐这儿吗', slug: 'lesson-10', sections: buildAutoSections(10) },
  { id: 11, title: '现在几点', slug: 'lesson-11', sections: buildAutoSections(11) },
  { id: 12, title: '明天天气怎么样', slug: 'lesson-12', sections: buildAutoSections(12) },
  { id: 13, title: '他在学做中国菜', slug: 'lesson-13', sections: buildAutoSections(13) },
  { id: 14, title: '她买了不少衣服', slug: 'lesson-14', sections: buildAutoSections(14) },
  { id: 15, title: '我是坐飞机来的', slug: 'lesson-15', sections: buildAutoSections(15) },
]

export function getLesson(id) {
  return lessons.find((l) => l.id === Number(id))
}
