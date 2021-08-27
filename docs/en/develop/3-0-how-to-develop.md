English | [Chinese](../../zh/develop/3-0-how-to-develop.md)

# Develop a new resource list page

- Step 1: Confirm the code location and directory structure
  - Place it under Containers according to the expected position in the menu item
  - Take the instance as an example, the corresponding menu item is `Compute-Instance`, then create the folder `src/pages/compute/containers/Instance`, create the file `src/pages/compute/containers/Instance/index.jsx `
- Step 2: Write the Store code
  - Refer to [3-5-BaseStore-introduction](3-5-BaseStore-introduction.md), copy the corresponding function
- Step 3: Code the list page
  - Refer to [3-1-BaseList-introduction](3-1-BaseList-introduction.md), copy the corresponding function
- Step 4: Configure routing
  - Refer to [3-13-Route-introduction](3-13-Route-introduction.md)
  - In the `routes/index.js` file of the parent directory in step 1, configure routing
  - If it is a brand new module, you also need to import it in `src/pages/storage/routes/index.js`
- Step 5: Configure menu
  - Refer to [3-12-Menu-introduction](3-12-Menu-introduction.md)
  - Configure the menu items of the console, which are configured in `src/layouts/menu.jsx`
  - Configure the menu items of the management platform, configured in `src/layouts/admin-menu.jsx`
- Step 6: i18n
  - Refer to [3-14-I18n-introduction](3-14-I18n-introduction.md), Complete the corresponding translation
- If the product requirement list page is a page containing `Tab`, please refer to [3-2-BaseTabList-introduction](3-2-BaseTabList-introduction.md), usually `Tab` is configured in `index.jsx` , Please refer to the mirror page code `src/pages/compute/containers/Image/index.jsx`

# Develop a new resource details page

- Step 1: Confirm the code location and directory structure
  - Place it under Containers according to the expected position in the menu item
  -  Take the instance as an example, the corresponding menu item is `Compute-Instance`, then create the folder `src/pages/compute/containers/Instance/Detail/index.jsx`，`src/pages/compute/containers/Instance/Detail/BaseDetail.jsx`
- Step 2: Write the Store code
  - Refer to [3-5-BaseStore-introduction](3-5-BaseStore-introduction.md), copy the corresponding function
- Step 3: Write the code of the detail page
  - Refer to [3-3-BaseDetail-introduction](3-3-BaseDetail-introduction.md), copy the corresponding function
- Step 4：Write detail page-details Tab code
  - Refer to [3-4-BaseDetailInfo-introduction](3-4-BaseDetailInfo-introduction.md), copy the corresponding function
- Step 5: Configure routing
  - Refer to [3-13-Route-introduction](3-13-Route-introduction.md)
  - In the `routes/index.js` file of the parent directory in step 1, configure routing
  - If it is a brand new module, you also need to import it in `src/pages/storage/routes/index.js`
- Step 6: Configure menu
  - Refer to [3-12-Menu-introduction](3-12-Menu-introduction.md)
  - Configure the menu items of the console, which are configured in `src/layouts/menu.jsx`
  - Configure the menu items of the management platform, configured in `src/layouts/admin-menu.jsx`
- Step 7: i18n
  - Refer to [3-14-I18n-introduction](3-14-I18n-introduction.md), Complete the corresponding translation

# Develop a new operation

## Develop a page-level operation

- Step 1: Confirm the code location and directory structure
  - Place it under Containers according to the expected position in the menu item
  - Take the instance as an example, the corresponding menu item is `Storage-Volume-Create Volume`, then create the folder `src/pages/storage/containers/Volume/actions/Create/index.jsx`
- Step 2: Write the Store code
  - Refer to [3-5-BaseStore-introduction](3-5-BaseStore-introduction.md), Copy or add the corresponding function
- Step 3: Write the FormAction code
  - Refer to [3-6-FormAction-introduction](3-6-FormAction-introduction.md), copy the corresponding function
- Step 4: Configure Action
  - Refer to [3-11-Action-introduction](3-11-Action-introduction.md), Configure to the corresponding position
- Step 5: Configure routing
  - Refer to [3-13-Route-introduction](3-13-Route-introduction.md), Configure the corresponding route
- Step 6: Configure the menu
  - Refer to [3-12-Menu-introduction](3-12-Menu-introduction.md)
  - Configure the menu items of the console, which are configured in `src/layouts/menu.jsx`
  - Configure the menu items of the management platform, configured in `src/layouts/admin-menu.jsx`
- Step 7: i18n
  - Refer to [3-14-I18n-introduction](3-14-I18n-introduction.md)，Complete the corresponding translation

## Develop a confirmation operation

- Step 1: Confirm the code location and directory structure
  - Place it under Containers according to the expected position in the menu item
  - Take the instance as an example, the corresponding menu item is `Storage-Volume-Delete Volume`, then create the folder `src/pages/storage/containers/Volume/actions/Delete.jsx`
- Step 2: Write the Store code
  - Refer to [3-5-BaseStore-introduction](3-5-BaseStore-introduction.md),  Copy or add the corresponding function
- Step 3: Write ConfirmAction code
  - Refer to [3-8-ConfirmAction-introduction](3-8-ConfirmAction-introduction.md)，copy the corresponding function
- Step 4: Configure Action
  - Refer to [3-11-Action-introduction](3-11-Action-introduction.md), Configure to the corresponding position
- Step 5: i18n
  - Refer to [3-14-I18n-introduction](3-14-I18n-introduction.md)，Complete the corresponding translation

## Develop a pop-up operation

- Step 1: Confirm the code location and directory structure
  - Place it under Containers according to the expected position in the menu item
  - Take the instance as an example, the corresponding menu item is `Storage-Volume-Edit Volume`, then create the folder `src/pages/storage/containers/Volume/actions/Edit.jsx`
- Step 2: Write the Store code
  - Refer to [3-5-BaseStore-introduction](3-5-BaseStore-introduction.md),  Copy or add the corresponding function
- Step 3: Write ModalAction code
  - Refer to [3-7-ModalAction-introduction](3-7-ModalAction-introduction.md)，copy the corresponding function
- Step 4: Configure Action
  - Refer to [3-11-Action-introduction](3-11-Action-introduction.md), Configure to the corresponding position
- Step 5: i18n
  - Refer to [3-14-I18n-introduction](3-14-I18n-introduction.md)，Complete the corresponding translation

## Develop a step-by-step page-level operation

- Step 1: Confirm the code location and directory structure
  - Place it under Containers according to the expected position in the menu item
  - Take the instance as an example, the corresponding menu item is `Compute-Instance-Create Instance`, then create the folder `src/pages/compute/containers/Instance/actions/StepCreate/index.jsx`
- Step 2: Write the Store code
  - Refer to [3-5-BaseStore-introduction](3-5-BaseStore-introduction.md),  Copy or add the corresponding function
- Step 3: Write StepAction code
  - Refer to [3-9-StepAction-introduction](3-9-StepAction-introduction.md)，copy the corresponding function
- Step 4: Configure Action
  - Refer to [3-11-Action-introduction](3-11-Action-introduction.md), Configure to the corresponding position
- Step 5: Configure routing
  - Refer to [3-13-Route-introduction](3-13-Route-introduction.md), Configure the corresponding route
- Step 6: Configure the menu
  - Refer to [3-12-Menu-introduction](3-12-Menu-introduction.md)
  - Configure the menu items of the console, which are configured in `src/layouts/menu.jsx`
  - Configure the menu items of the management platform, configured in `src/layouts/admin-menu.jsx`
- Step 7: i18n
  - Refer to [3-14-I18n-introduction](3-14-I18n-introduction.md)，Complete the corresponding translation
