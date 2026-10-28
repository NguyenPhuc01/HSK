import { HSK1_LESSONS } from '../data/hsk1Lessons'

/** Chọn Bài 1–15 hoặc Tất cả — dùng chung nhận diện / luyện dịch. */
export default function LessonFilter({ value, onChange, counts }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Theo bài giáo trình</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none ring-teal-500 focus:border-teal-400 focus:ring-2"
      >
        <option value="all">
          Tất cả{counts?.all != null ? ` (${counts.all})` : ''}
        </option>
        {HSK1_LESSONS.map((lesson) => {
          const n = counts?.byLesson?.[lesson.id]
          return (
            <option key={lesson.id} value={String(lesson.id)}>
              Bài {lesson.id} — {lesson.title}
              {n != null ? ` (${n})` : ''}
            </option>
          )
        })}
      </select>
    </label>
  )
}
