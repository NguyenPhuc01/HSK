# HSK 1 Reader

Trang học HSK 1 — xem **toàn bộ giáo trình PDF (143 trang)** kèm audio ở các bài có file MP3.

## Cài đặt

```bash
cd ~/Documents/hsk1-reader
npm install
npm run download-all   # Tải PDF giáo trình + 86 file MP3
npm run dev
```

Mở http://localhost:5173

## Giao diện

- **Menu trái**: Mục lục đầy đủ — Giới thiệu · 15 bài học · Phụ lục (词语表, 汉字索引, đáp án...)
- **Content phải**: PDF giáo trình — lật trang tự do trong 143 trang
- **Audio**: Chỉ hiện khi bài đó có file MP3 (icon loa cạnh mã `02-6`...)
- Phần không có audio vẫn xem PDF bình thường

## Nguồn tài liệu

- [Giáo trình PDF](https://drive.google.com/file/d/1KAtFbofFT2Tx_HWCfR64365k62VKNGS4/view)
- [Thư mục MP3 + PDF](https://drive.google.com/drive/folders/1p0Ga8BeHtZOm3sLZigODJNynWuFASieQ)

## Cấu hình mục lục

Chỉnh trang PDF mỗi phần: `src/data/textbookSections.js`
