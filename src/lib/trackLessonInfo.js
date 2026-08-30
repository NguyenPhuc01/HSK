import { textbookSections } from '../data/textbookSections'

export function getLessonInfoFromTrackLabel(label) {
  if (!label) return { badge: '', lessonTitle: 'HSK 1' }

  if (label.startsWith('00')) {
    return { badge: label, lessonTitle: 'Giới thiệu' }
  }

  const match = label.match(/^(\d{2})-/)
  if (!match) return { badge: label, lessonTitle: label }

  const lessonNum = Number(match[1])
  const section = textbookSections.find((s) => s.lessonId === lessonNum)
  return {
    badge: label,
    lessonTitle: section?.title ?? `Bài ${lessonNum}`,
  }
}
