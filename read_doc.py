from docx import Document
doc = Document(r'C:/Users/Freid/.gemini/antigravity/brain/f86debb7-7d3e-4bbb-8850-b98695a145f4/.user_uploaded/media_1795025901429_a2250c96.docx')
for p in doc.paragraphs:
    if p.text.strip():
        print(p.text)

