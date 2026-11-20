"""打包云函数，保留 Unix 可执行权限位（scf_bootstrap 需要 755）

Windows 的 Compress-Archive 不保留 Unix 权限位，腾讯云解压后 scf_bootstrap
没有 +x，直接执行会 Permission denied → 函数启动失败 → 网关 502。
这里用 zipfile 显式写 external_attr，还原 755/644。
"""
import os
import zipfile

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "lead-handler")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "lead-handler.zip")

FILES = ["index.js", "server.js", "scf_bootstrap", "package.json"]

# 0o100755 = 普通文件 + 755；0o100644 = 普通文件 + 644
MODES = {
    "scf_bootstrap": 0o100755,
    "index.js": 0o100644,
    "server.js": 0o100644,
    "package.json": 0o100644,
}

if os.path.exists(OUT):
    os.remove(OUT)

with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
    for name in FILES:
        path = os.path.join(SRC, name)
        info = zipfile.ZipInfo(name)
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = MODES[name] << 16
        info.create_system = 3  # Unix
        with open(path, "rb") as f:
            z.writestr(info, f.read())

print("已生成:", OUT, os.path.getsize(OUT), "字节")
with zipfile.ZipFile(OUT) as z:
    for i in z.infolist():
        mode = oct(i.external_attr >> 16)
        print(f"  {i.filename:<20} 权限位 {mode}")
