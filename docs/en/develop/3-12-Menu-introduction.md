English | [简体中文](../../zh/develop/3-12-Menu-introduction.md)

# Usage

- Jump to the corresponding page after click
- Configuration of menu item on the left side of the console platform

  ![console-platform](../../zh/develop/images/menu/console-menu.png)

- Configuration of menu item on the left side of the management platform

  ![management-platform](../../zh/develop/images/menu/admin-menu.png)

- Support first-level menu with icon
- Support secondary menu expand
- Support menu item selected automatically switch after route change
- Support for automatic processing of breadcrumbs in the right side

# Code location

- Console platform menu configuration `src/layouts/menu.jsx`
- Management platform menu configuration `src/layouts/admin-menu.jsx`

# How to use

- The menu configuration in console and management platform are the same structure
- Return a `renderMenu` function which return a configuration list

## first-level menu configuration

- `path`
  - URL
- `name`
  - Name of route
  - Name of menu item in menu list
  - Name corresponding to the first level menu in breadcrumbs
- `key`
  - ID of the route
  - Unique
- `icon`
  - the icon of menu
  - When the menu is fully expanded, the icon and name are displayed.
  - When the menu is folded, only the icon is displayed.
- `hasBreadcrumb`
  - Whether to show breadcrumbs
  - Default is `true`
  - Take `home page` as an example: `hasBreadcrumb: false`
- `hasChildren`
  - Whether the first-level menu contains a submenu
  - Default is `true`
  - First-level menu may not contain a submenu. For example `home page`.

  ```javascript
  {
    path: '/base/overview',
    name: t('Home'),
    key: '/home',
    icon: <HomeOutlined />,
    hasBreadcrumb: false,
    hasChildren: false,
  }
  ```

  - First-level menu default contains submenu. For example `compute page`.

    ```javascript
    {
        path: '/compute',
        name: t('Compute'),
        key: '/compute',
        icon: <DesktopOutlined />,
        children: [...]
      }
    ```

## Submenu configuration

- Submenu is configured in the `children` of first-level menu.
- Pages that do not need to be displayed in the menu, such as detail page, create page, are configured in the `children` of the submenu.
- Take flavor as an example

  ```javascript
  {
      path: '/compute/flavor',
      name: t('Flavor'),
      key: '/compute/flavor',
      level: 1,
      children: [
        {
          path: /^\/compute\/flavor\/detail\/.[^/]+$/,
          name: t('Flavor Detail'),
          key: 'flavor-detail',
          level: 2,
        },
      ],
    },
  ```

- `path`
  - Route corresponding to the menu
- `name`
  - name of menu
  - Name of menu item in menu list
  - Name in breadcrumbs
- `key`
  - ID of menu
  - Unique
- `level`
  - submenu correspond to `level=1`
  - `children` in submenu correspond to `level=2`
