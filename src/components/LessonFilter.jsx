import { HSK1_LESSONS } from '../data/hsk1Lessons'

/** Chọn Bài 1–15 hoặc Tất cả — dùng chung nhận diện / luyện dịch. */
export default function LessonFilter({ value, onChange, counts }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Theo bài giáo trình</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-slate-200 bg-white bg-[length:1rem] bg-[right_0.875rem_center] bg-no-repeat py-2.5 pl-3.5 pr-11 text-sm text-slate-800 outline-none ring-teal-500 focus:border-teal-400 focus:ring-2"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%6494a3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
        }}
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
