import sys

from skyline_console import static_path

if static_path.joinpath("index.html").exists():
    print(f'Static resource directory of "skyline-console" is:\n{str(static_path)}')
else:
    print('Error, "skyline-console" doesn\'t contain any static resources')
    sys.exit(1)
