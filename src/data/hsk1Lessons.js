/**
 * Giáo trình HSK1 theo file tổng hợp cô giáo (Bài 1–15).
 * Dùng để lọc nhận diện / luyện dịch và chuẩn hóa công thức chung.
 */

export const HSK1_LESSONS = [
  {
    id: 1,
    title: 'Chào hỏi',
    vocab: ['你', '好', '您', '你好', '你们', '对不起', '没关系'],
    patterns: ['你好', '对不起 → 没关系'],
  },
  {
    id: 2,
    title: 'Cảm ơn / tạm biệt',
    vocab: ['谢谢', '不', '不客气', '再见'],
    patterns: ['谢谢 → 不客气', '再见'],
  },
  {
    id: 3,
    title: 'Giới thiệu · 是 · 吗 · 什么',
    vocab: ['叫', '什么', '名字', '我', '是', '老师', '吗', '学生'],
    patterns: ['S + V + 什么(+ N)？', 'S + (不)是 + N', '……吗？'],
  },
  {
    id: 4,
    title: '谁 · 哪 · 的 · 呢',
    vocab: ['他', '她', '谁', '的', '汉语', '哪', '国', '呢', '同学', '朋友'],
    patterns: ['谁……？', '哪 + N', 'S + 的 + N', 'A……。B呢？'],
  },
  {
    id: 5,
    title: 'Gia đình · tuổi',
    vocab: ['家', '有', '口', '女儿', '几', '岁', '了', '今年', '多', '大'],
    patterns: ['几 + lượng từ + N', '……了', '多大 / 几岁'],
  },
  {
    id: 6,
    title: '会 · tính từ · 怎么',
    vocab: ['会', '说', '妈妈', '菜', '很', '字', '好吃', '做', '写', '汉字', '怎么', '读'],
    patterns: ['S + (不)会 + V', 'S + 很/不 + Adj', 'S + 怎么 + V？'],
  },
  {
    id: 7,
    title: 'Ngày tháng · 去 + V',
    vocab: ['请', '问', '今天', '明天', '昨天', '号', '日', '月', '星期', '去', '学校', '看', '书'],
    patterns: ['月 + 日/号 + 星期', 'S + 去 + địa điểm + V'],
  },
  {
    id: 8,
    title: '想 · 多少 · lượng từ',
    vocab: ['想', '喝', '茶', '吃', '米饭', '下午', '商店', '买', '杯子', '这', '多少', '钱', '块', '那', '个'],
    patterns: ['(不)想 + V', '多少 + N', 'số + lượng từ + N'],
  },
  {
    id: 9,
    title: '在 · địa điểm · 哪儿',
    vocab: ['小', '猫', '狗', '在', '那儿', '椅子', '下面', '下', '哪儿', '工作', '儿子', '医院', '医生', '爸爸'],
    patterns: ['S + 在 + địa điểm', 'S + 在 + địa điểm + V', '在 + 哪儿？'],
  },
  {
    id: 10,
    title: '有 · 和 · 能 · 请',
    vocab: ['桌子', '上', '电脑', '和', '本', '里', '前面', '后面', '这儿', '没有', '没', '能', '坐'],
    patterns: ['Địa điểm + (没)有 + N', 'A和B', '能 + V', '请 + V'],
  },
  {
    id: 11,
    title: 'Giờ · thời gian · 前',
    vocab: ['现在', '点', '分', '中午', '吃饭', '时候', '回', '我们', '电影', '住', '前', '北京'],
    patterns: ['……点……分', 'S + thời gian + …', 'Thời gian + S + …', '……前'],
  },
  {
    id: 12,
    title: 'Thời tiết · 太 · 会(sẽ)',
    vocab: ['天气', '怎么样', '太', '热', '冷', '下雨', '小姐', '来', '身体', '爱', '些', '水果', '水'],
    patterns: ['怎么样？', '太……了', '会 = sẽ'],
  },
  {
    id: 13,
    title: '喂 · 也 · 在……呢 · 吧',
    vocab: ['喂', '也', '学习', '学', '上午', '睡觉', '电视', '喜欢', '给', '打电话', '吧'],
    patterns: ['喂', 'S + 也 + V', 'S + 在 + V + 呢', '……吧'],
  },
  {
    id: 14,
    title: '了 · 后 · 啊 · 都',
    vocab: ['东西', '一点儿', '苹果', '看见', '先生', '开', '车', '回来', '分钟', '后', '衣服', '漂亮', '啊', '少', '不少', '这些', '都'],
    patterns: ['V + O + 了 / V + 了 + O', '……后', '……啊', '都'],
  },
  {
    id: 15,
    title: '认识 · 是……的',
    vocab: ['认识', '年', '大学', '饭店', '出租车', '一起', '高兴', '听', '飞机'],
    patterns: ['是……的', '年 + 月 + 日/号 + 星期'],
  },
]

const hanziToLesson = new Map()
for (const lesson of HSK1_LESSONS) {
  for (const hanzi of lesson.vocab) {
    if (!hanziToLesson.has(hanzi)) hanziToLesson.set(hanzi, lesson.id)
  }
}

export function getLessonById(id) {
  return HSK1_LESSONS.find((l) => l.id === Number(id)) ?? null
}

/** Bài giáo trình của một mục từ (nếu có trong danh sách cô). */
export function getLessonIdForHanzi(hanzi) {
  return hanziToLesson.get(hanzi) ?? null
}

export function filterVocabByLesson(vocab, lessonId) {
  if (lessonId == null || lessonId === 'all') return vocab
  const lesson = getLessonById(lessonId)
  if (!lesson) return vocab
  const set = new Set(lesson.vocab)
  return vocab.filter((v) => set.has(v.hanzi))
}

export function filterSentencesByLesson(sentences, lessonId) {
  if (lessonId == null || lessonId === 'all') return sentences
  const id = Number(lessonId)
  return sentences.filter((s) => s.lesson === id)
}
