"""Minimal XLSX reader using the Python standard library only."""

from __future__ import annotations

import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
REL_NS = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"


def _col_index(cell_ref: str) -> int:
    letters = "".join(ch for ch in cell_ref if ch.isalpha())
    index = 0
    for ch in letters:
        index = index * 26 + (ord(ch.upper()) - ord("A") + 1)
    return index - 1


def _shared_strings(archive: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in archive.namelist():
        return []
    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    values: list[str] = []
    for si in root.findall("m:si", NS):
        texts = [node.text or "" for node in si.findall(".//m:t", NS)]
        values.append("".join(texts))
    return values


def _sheet_target(archive: zipfile.ZipFile, sheet_name: str) -> str:
    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    rid = None
    for sheet in workbook.findall("m:sheets/m:sheet", NS):
        if sheet.attrib.get("name") == sheet_name:
            rid = sheet.attrib.get(f"{REL_NS}id")
            break
    if rid is None:
        raise ValueError(f'Sheet "{sheet_name}" not found')

    rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    for rel in rels:
        if rel.attrib.get("Id") == rid:
            target = rel.attrib["Target"].lstrip("/")
            if target.startswith("xl/"):
                return target
            return f"xl/{target}"
    raise ValueError(f'Relationship for sheet "{sheet_name}" not found')


def read_sheet_rows(path: Path, sheet_name: str) -> list[list[str | None]]:
    with zipfile.ZipFile(path) as archive:
        shared = _shared_strings(archive)
        sheet_path = _sheet_target(archive, sheet_name)
        root = ET.fromstring(archive.read(sheet_path))
        rows: list[list[str | None]] = []

        for row in root.findall("m:sheetData/m:row", NS):
            values: dict[int, str | None] = {}
            max_col = -1
            for cell in row.findall("m:c", NS):
                ref = cell.attrib.get("r", "A1")
                col = _col_index(ref)
                max_col = max(max_col, col)
                cell_type = cell.attrib.get("t")
                value_node = cell.find("m:v", NS)
                if value_node is None or value_node.text is None:
                    values[col] = None
                    continue
                raw = value_node.text
                if cell_type == "s":
                    values[col] = shared[int(raw)]
                else:
                    values[col] = raw
            if max_col < 0:
                rows.append([])
            else:
                rows.append([values.get(i) for i in range(max_col + 1)])
        return rows
