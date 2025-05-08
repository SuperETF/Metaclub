import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faAlignJustify,
} from "@fortawesome/free-solid-svg-icons";

interface RichEditorAppProps {
  content: string;
  onChange: (value: string) => void;
}

const RichEditorApp: React.FC<RichEditorAppProps> = ({ content, onChange }) => {
  const [mode, setMode] = useState<"rich" | "html">("rich");
  const [htmlText, setHtmlText] = useState(content);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Underline,
      TextStyle,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      if (mode === "rich") onChange(editor.getHTML());
    },
  });

  // HTML <-> Rich 전환 시 데이터 동기화
  useEffect(() => {
    if (!editor) return;

    if (mode === "html") {
      setHtmlText(editor.getHTML()); // 에디터 → textarea
    } else {
      editor.commands.setContent(htmlText); // textarea → 에디터
    }
  }, [mode, editor]);

  if (!editor) return null;

  return (
    <div className="space-y-4 bg-gray-50 w-full font-[Paperlogy]">
      {/* 툴바 그룹 */}
      <div className="bg-white p-3 border rounded-md shadow-sm space-y-2">
        {/* 상단 툴바: 텍스트 스타일 + HTML 버튼 */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-3 py-1 border rounded-md ${editor.isActive("bold") ? "bg-blue-100 font-bold" : ""}`}
          >
            굵게
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-3 py-1 border rounded-md ${editor.isActive("italic") ? "bg-blue-100 italic" : ""}`}
          >
            기울임
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`px-3 py-1 border rounded-md ${editor.isActive("highlight") ? "bg-yellow-200" : ""}`}
          >
            형광펜
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`px-3 py-1 border rounded-md ${editor.isActive("underline") ? "bg-blue-100 underline" : ""}`}
          >
            밑줄
          </button>

          {/* ✅ HTML 토글 버튼 (바로 옆에 위치) */}
          <button
            onClick={() => setMode(mode === "rich" ? "html" : "rich")}
            className="px-3 py-1 border rounded-md text-sm bg-white shadow-sm ml-auto"
          >
            {mode === "rich" ? "html" : "edit"}
          </button>
        </div>

        {/* 정렬 버튼: 모바일에서 줄바꿈 */}
        <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-2 items-center">
          <button
            title="왼쪽 정렬"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`px-3 py-1 border rounded-md text-xl ${editor.isActive({ textAlign: "left" }) ? "bg-blue-100" : ""}`}
          >
            <FontAwesomeIcon icon={faAlignLeft} />
          </button>
          <button
            title="가운데 정렬"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`px-3 py-1 border rounded-md text-xl ${editor.isActive({ textAlign: "center" }) ? "bg-blue-100" : ""}`}
          >
            <FontAwesomeIcon icon={faAlignCenter} />
          </button>
          <button
            title="오른쪽 정렬"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`px-3 py-1 border rounded-md text-xl ${editor.isActive({ textAlign: "right" }) ? "bg-blue-100" : ""}`}
          >
            <FontAwesomeIcon icon={faAlignRight} />
          </button>
          <button
            title="양쪽 정렬"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={`px-3 py-1 border rounded-md text-xl ${editor.isActive({ textAlign: "justify" }) ? "bg-blue-100" : ""}`}
          >
            <FontAwesomeIcon icon={faAlignJustify} />
          </button>
        </div>
      </div>

      {/* 본문 영역 */}
      {mode === "rich" ? (
        <div
          className={`relative bg-white p-6 min-h-[300px] rounded-md shadow-sm cursor-text border transition
            ${editor.isFocused ? "border-gray-800" : "border-gray-200 hover:border-gray-400"}`}
          onClick={() => editor.commands.focus()}
        >
          <EditorContent editor={editor} className="outline-none focus:outline-none" />
        </div>
      ) : (
        <textarea
          value={htmlText}
          onChange={(e) => {
            setHtmlText(e.target.value);
            onChange(e.target.value);
          }}
          className="w-full h-[300px] border p-4 rounded resize-none font-mono text-sm bg-white"
          placeholder="<h1>HTML을 직접 입력하세요</h1>"
        />
      )}
    </div>
  );
};

export default RichEditorApp;
