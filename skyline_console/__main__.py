import sys
from pathlib import Path

import skyline_console

static_path = Path(skyline_console.__file__).parent.joinpath("static")

if static_path.joinpath("index.html").exists():
    print(f'Static resource directory of "skyline-console" is:\n{str(static_path)}')
else:
    print('Error, "skyline-console" doesn\'t contain any static resources')
    sys.exit(1)
