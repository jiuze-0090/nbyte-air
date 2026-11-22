"""打包云函数，保留 Unix 可执行权限位（scf_bootstrap 需要 755）

Windows 的 Compress-Archive 不保留 Unix 权限位，腾讯云解压后 scf_bootstrap
没有 +x，直接执行会 Permission denied → 函数启动失败 → 网关 502。
这里用 zipfile 显式写 external_attr，还原 755/644。

用法：
    python pack.py                # 生成 lead-handler.zip（含 scf_bootstrap，755）
    python pack.py --no-bootstrap  # 生成 lead-handler-console.zip（不含 scf_bootstrap）

第二种包给「控制台启动命令接管」的场景用：
包里检测不到 scf_bootstrap 时，控制台「高级配置 > 启动命令」的输入框才会生效，
由腾讯云生成 scf_bootstrap 并保证权限，避开 zip 丢执行位的问题。
"""
import os
import sys
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "lead-handler")

FILES = ["index.js", "leads-db.js", "server.js", "scf_bootstrap", "package.json"]

# 0o100755 = 普通文件 + 755；0o100644 = 普通文件 + 644
MODES = {
    "scf_bootstrap": 0o100755,
    "index.js": 0o100644,
    "leads-db.js": 0o100644,
    "server.js": 0o100644,
    "package.json": 0o100644,
}

no_bootstrap = "--no-bootstrap" in sys.argv

if no_bootstrap:
    OUT = os.path.join(HERE, "lead-handler-console.zip")
    FILES = [f for f in FILES if f != "scf_bootstrap"]
else:
    OUT = os.path.join(HERE, "lead-handler.zip")

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
