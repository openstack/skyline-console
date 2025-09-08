# Build & Deploy Wheel

## Build

- Use NVM to load [.nvmrc](../../../.nvmrc) and set up the needed version of Node.js.
- Use `make package` under the project root directory to build the wheel.
- The built wheel would be under `./dist/*.whl`.
- Rename the `.whl` file to `skyline_console-3.1.0-py3-none-any.whl`.

## Deploy

- Copy the built wheel to the target CubeCOS machines.

```bash
pip3 uninstall -y skyline-console
pip3 install "path to .whl file"
pip3 list | grep skyline-console
```
