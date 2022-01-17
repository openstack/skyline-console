English | [简体中文](../../zh/develop/3-13-Route-introduction.md)

# Usage

- Pages that need to display independently should configure route
  - According to the needs of the product, the page under submenu needs to display in page, for example `compute - instance`.
    - Resource list page
      - For example, instance list page.
      - Note that the relevant resource listings under the details page does not need to be configured
    - Resource detail page
      - For example, instance detail page.
    - Form that need whole page to show
      - For example, create instance page.
  - Some menus have only first-level page, such as `Home`, you also need to configure routing

# How to use

## The submenu corresponds to the route

- According to the requirements in the [catalog introduction](2-catalog-introduction.md), each first-level menu page has a separate folder under `pages`, the `containers` folder in it is used to place the submenu page code, `routes` folder is used to configure the route.
- Configuration is in `pages/xxxx/routes/index.js`
- The route configuration needs to follow a fixed format, see `src/pages/compute/routes/index.js`
  - List
  - Each child in the list, should follow:
    - `path`, first-level menu corresponding name, for example nova compute use `compute`.
    - `component`, layout components
      - Pages about `auth`, for example `login`, use `src/layouts/User/index.jsx`
      - Pages show after login, for example `instance`, use `src/layouts/Base/index.jsx`
        - The layout automatically handles the display of the `menu item`, the right side of the content `header`, `breadcrumb`, etc.
    - `routes`, The main content of the configuration is an array.
      - Take compute route as an example `src/pages/compute/routes/index.js` :

        ```javascript
        { path: `${PATH}/instance`, component: Instance, exact: true },
        ```

      - `path`, Path corresponding to each full page, for example `compute/instance`
      - `component`, the component corresponding to page, such as component under `containers`

- For resource-type pages, generally configured
  - List page, details page, complex create page in console platform (simple creation generally uses modal)
  - List page, detail page in management platform (with `-admin`/`_admin` in path)
  - For detail page, we recommend using `id`
  - Take instance as an example `src/pages/compute/routes/index.js`

    ```javascript
    { path: `${PATH}/instance`, component: Instance, exact: true },
    { path: `${PATH}/instance-admin`, component: Instance, exact: true },
    {
      path: `${PATH}/instance/detail/:id`,
      component: InstanceDetail,
      exact: true,
    },
    {
      path: `${PATH}/instance-admin/detail/:id`,
      component: InstanceDetail,
      exact: true,
    },
    { path: `${PATH}/instance/create`, component: StepCreate, exact: true },
    ```

## The route corresponding to the first-level menu

- First-level menu should add in `src/core/routes.js`
- Take compute as an example

  ```javascript
  {
      path: '/compute',
      component: Compute,
    },
  ```
