#!/usr/bin/env python3
"""Generate original, openly labelled narrated degree explainers from HIAU-owned course descriptions.

Each file is a real MP4 with generated visual slides and synthetic voice, not invented
footage of actual classes, lecturers, students or campus facilities. Requires:
  python3, Pillow, ffmpeg, ffprobe and espeak.
"""
from __future__ import annotations
import json
import math
import os
from pathlib import Path
import re
import subprocess
import tempfile
import wave
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "scripts/hiau-degree-video-content.json").read_text())
OUT = ROOT / "public/assets/degree-clips"
OUT.mkdir(parents=True, exist_ok=True)
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
WIDTH, HEIGHT = 768, 432
PURPLE = "#4A1249"
GOLD = "#C39A53"
WHITE = "#FFFFFF"
INK = "#21162A"
IMAGE = ROOT / "public/assets/aistudio/image_29eb5504.png"
CAMERA_IMAGE = Image.open(IMAGE).convert("RGB") if IMAGE.is_file() else None

def slug(s: str) -> str:
    s = s.lower()
    return re.sub(r"(^-+|-+$)", "", re.sub("[^a-z0-9]+", "-", s))

def font(size: int, bold: bool=False):
    return ImageFont.truetype(FONT_BOLD if bold else FONT, size)

def lines(text: str, max_width: int, draw: ImageDraw.ImageDraw, face):
    output, current = [], []
    for word in text.split():
        attempt = " ".join(current + [word])
        if draw.textbbox((0, 0), attempt, font=face)[2] <= max_width or not current:
            current.append(word)
        else:
            output.append(" ".join(current))
            current = [word]
    if current:
        output.append(" ".join(current))
    return output

def render_slide(destination: Path, degree_name: str, kicker: str, heading: str, body: str, index: int, total: int):
    img = Image.new("RGB", (WIDTH, HEIGHT), "#FAF8FB")
    draw = ImageDraw.Draw(img)
    # Authentic HIAU-owned image is intentionally atmospheric and not shown as degree-specific.
    if CAMERA_IMAGE is not None:
        photo = ImageOps.fit(CAMERA_IMAGE, (WIDTH, HEIGHT), method=Image.Resampling.LANCZOS)
        img.paste(Image.blend(photo, Image.new("RGB", (WIDTH, HEIGHT), PURPLE), 0.83))
    else:
        draw.rectangle([0, 0, WIDTH, HEIGHT], fill=PURPLE)
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, WIDTH, 11], fill=GOLD)
    draw.rounded_rectangle((40, 45, 260, 77), radius=8, fill="#F0E0C4")
    draw.text((53, 52), kicker.upper()[:29], font=font(15, True), fill=PURPLE)
    y = 105
    title_face = font(35, True)
    for ln in lines(heading, WIDTH-95, draw, title_face)[:3]:
        draw.text((42, y), ln, fill=WHITE, font=title_face)
        y += 47
    y += 18
    body_face = font(23)
    for ln in lines(body, WIDTH-95, draw, body_face)[:7]:
        draw.text((43, y), ln, fill="#F9EFF9", font=body_face)
        y += 34
    draw.rectangle([42, HEIGHT-65, WIDTH-42, HEIGHT-63], fill=GOLD)
    draw.text((42, HEIGHT-52), "HIAU  |  EDUCATIONAL DEGREE EXPLAINER", font=font(13, True), fill="#E5C88C")
    draw.text((WIDTH-110, HEIGHT-52), f"{index} / {total}", font=font(13, True), fill="#E5C88C")
    img.save(destination, optimize=True)

def synthesize(text: str, path: Path) -> float:
    subprocess.run(["espeak", "-v", "en-us", "-s", "158", "-a", "130", "-w", str(path), text],
                   check=True, stdout=subprocess.DEVNULL)
    with wave.open(str(path), "rb") as audio:
        if audio.getnchannels() != 1:
            raise RuntimeError("Expected mono narration")
        return audio.getnframes() / audio.getframerate()

def main():
    count = 0
    for degree in DATA["degrees"]:
        name = degree["name"]
        slugname = degree["college"] + "--" + slug(name)
        phrases = [
            ("Degree introduction", name, degree["learn"], f"Welcome to a general introduction to {name}. {degree['learn']}"),
            ("Relevance today", "Why it matters today", degree["today"], f"Why does this field matter today? {degree['today']}"),
            ("Future directions", "Potential career pathways", degree["careers"], f"Where might this knowledge lead? {degree['careers']}"),
            ("Important information", "Explore with HIAU", "Learn more about program requirements and availability from the university's admissions office.", "This is an educational overview, not an official course catalog or employment guarantee. Confirm current program availability and requirements with HIAU admissions."),
        ]
        target = OUT / (slugname + ".mp4")
        with tempfile.TemporaryDirectory(prefix="hiau-degree-") as tmp:
            temporary = Path(tmp)
            slides = []
            clips = []
            for i, (kicker, heading, body, words) in enumerate(phrases, 1):
                image = temporary / f"slide-{i:02d}.png"
                audio = temporary / f"voice-{i:02d}.wav"
                render_slide(image, name, kicker, heading, body, i, len(phrases))
                duration = synthesize(words, audio) + 0.25
                clips.append((audio, duration))
                slides.append((image, duration))
            # Use matching mono PCM waveform formats and merge audio segments.
            combined = temporary / "narration.wav"
            with wave.open(str(clips[0][0]), "rb") as first:
                params = first.getparams()
            with wave.open(str(combined), "wb") as result:
                result.setparams(params)
                for wavefile, _ in clips:
                    with wave.open(str(wavefile), "rb") as source:
                        if source.getparams()[:3] != params[:3]:
                            raise RuntimeError("Narration segment formats differ")
                        result.writeframes(source.readframes(source.getnframes()))
            filelist = temporary / "slides.ffconcat"
            with filelist.open("w") as playlist:
                playlist.write("ffconcat version 1.0\n")
                for frame, duration in slides:
                    playlist.write(f"file '{frame}'\n")
                    playlist.write(f"duration {duration:.3f}\n")
                playlist.write(f"file '{slides[-1][0]}'\n")
            subprocess.run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                "-safe", "0", "-f", "concat", "-i", str(filelist),
                "-i", str(combined), "-r", "12", "-s", f"{WIDTH}x{HEIGHT}",
                "-c:v", "libx264", "-preset", "ultrafast", "-crf", "31",
                "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "48k",
                "-movflags", "+faststart", "-shortest", str(target)
            ], check=True)
        if not target.exists() or target.stat().st_size < 15000:
            raise RuntimeError(f"Generated clip missing or too small: {target}")
        count += 1
        print(f"Created {target.relative_to(ROOT)} ({target.stat().st_size} bytes)", flush=True)
    print(f"Generated {count} original narrated degree explainers.")

if __name__ == "__main__":
    main()
