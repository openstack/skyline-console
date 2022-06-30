English | [简体中文](../../zh/develop/3-9-StepAction-introduction.md)

# Usage

![StepForm](../../zh/develop/images/form/step.png)

- After click the action button, the step modal will display.
- Has it own route to visit
- Generally used to create resources, or form with lots of form items
- Support `Next Step`, `Previous Step` action button
- After click the `Cancel` button, will automatically jump to the corresponding resource list page
- If the request is sent successfully, a prompt message of successful action will be displayed in the upper right corner, and it will automatically disappear after a few seconds.

  ![FormOneStep](../../zh/develop/images/form/create-success.png)

- If the request fails, an error message will be displayed in the upper right corner of the form page, which can only disappear after clicking the close button.

# StepAction code file

- `src/containers/Action/StepAction/index.jsx`

# StepAction attribute and function definitions introduction

- Step forms are all inherited from `StepAction` component
- Code location: `pages/xxxx/containers/XXXX/actions/xxx/index.jsx`
- Only need to override some functions and the development of page will be completed
- Need to write every step of the Form
- Attributes and functions are divided into the following four types:
  - The attributes and functions that must be override, mainly include:
    - Action ID
    - Action title
    - The page's location
    - The corresponding resource page location
    - Action permissions
    - Judgment whether to disable the action button
    - Form Item config
    - Function to send request
    - Configuration of each step
  - The attributes and functions that override in need, mainly include:
    - Whether there is a confirmation page
    - Prompt after successful request
    - Prompt after failed request
    - Rendering of the data on the bottom left of the page
  - The attributes and functions that do not need to be override, mainly include:
    - Whether the current page is a admin page
  - The basic functions in the parent class, mainly include:
    - Render page
    - Display of request status
    - Display of request results
- See below for a more detailed and comprehensive introduction

## The attributes and functions that must be override

- `id`
  - Static
  - Resource action ID
  - Need to be unique, only for all actions in the `actions` of the resource to be unique
  - Must be override
  - Take create instance as an example `src/pages/compute/containers/Instance/actions/StepCreate/index.jsx` :

    ```javascript
    static id = 'instance-create';
    ```

- `title`
  - Static
  - Resource action title
  - Take create instance as an example `src/pages/compute/containers/Instance/actions/StepCreate/index.jsx` :

    ```javascript
    static title = t('Create Instance');
    ```

- `path`
  - Thr corresponding route for resource action
  - Static attribute or function
  - When it is static function, here are the params
    - Param `item`, the item data in the resource page
    - Param `containerProps`, the `props` of the father component. (That is, the resource list page where the button is located)
    - Take create instance as an example `src/pages/compute/containers/Instance/actions/StepCreate/index.jsx` :
      - Click the `Create instance` button in the instance list page, the page will jump to `/compute/instance/create`
      - Click the `Create instance` button in the instance group list page, the page will jump to `/compute/instance/create?servergroup=${detail.id}`

      ```javascript
      static path = (_, containerProps) => {
        const { detail, match } = containerProps || {};
        if (!detail || isEmpty(detail)) {
          return '/compute/instance/create';
        }
        if (match.path.indexOf('/compute/server') >= 0) {
          return `/compute/instance/create?servergroup=${detail.id}`;
        }
      };
      ```

  - Static attribute, Take create flavor as an example `src/pages/compute/containers/Flavor/actions/StepCreate/index.jsx` :

    ```javascript
    static path = '/compute/flavor-admin/create';
    ```

- `policy`
  - Static attribute (Fill in the policy that complies with the openstack rules here)
  - The permission corresponding to the page, if the permission verification fails, the action button will not be displayed on the resource list page
  - Take create instance as an example `src/pages/compute/containers/Instance/actions/StepCreate/index.jsx` :

    ```javascript
    static policy = [
      'os_compute_api:servers:create',
      'os_compute_api:os-availability-zone:list',
    ];
    ```

- `aliasPolicy`
  - Static attribute (Fill in the custom policy with module prefix here)
  - The permission corresponding to the page, if the permission verification fails, the action button will not be displayed on the resource list page
  - Take create instance as an example `src/pages/compute/containers/Instance/actions/StepCreate/index.jsx` :

    ```javascript
    static aliasPolicy = [
      'nova:os_compute_api:servers:create',
      'nova:os_compute_api:os-availability-zone:list',
    ];
    ```

- `allowed`
  - Static
  - Determine whether the action button needs to be disabled
  - Return `Promise`
  - Button that no need to be disabled, write directly:

    ```javascript
    static allowed() {
      return Promise.resolve(true);
    }
    ```

- `name`
  - The name of the action
  - Use the name in the prompt after the request
  - Take create instance as an example `src/pages/compute/containers/Instance/actions/StepCreate/index.jsx` :

    ```javascript
    get name() {
      return t('Create instance');
    }
    ```

- `listUrl`
  - The resource list page corresponding to the action
  - After the operation request is successful, it will automatically jump to the resource list page
  - Take create instance as an example `src/pages/compute/containers/Instance/actions/StepCreate/index.jsx` :
    - In the action column of the image list page, click Create a instance and successfully create, will return to the image list page
    - In the action column of the volume list page, click Create a instance and successfully create, will return to the volume list page
    - In the instance group detail page, click Create a instance and successfully create, will return to the instance group detail page
    - In the instance list page, click Create a instance and successfully create, will return to the instance list page

    ```javascript
    get listUrl() {
      const { image, volume, servergroup } = this.locationParams;
      if (image) {
        return '/compute/image';
      }
      if (volume) {
        return '/storage/volume';
      }
      if (servergroup) {
        return `/compute/server-group/detail/${servergroup}`;
      }
      return '/compute/instance';
    }
    ```

- `steps`
  - Configuration of each step
  - Each configuration item
    - `title`, title of each step
    - `component`, every step form the corresponding components, inherit from `BaseForm`(`src/components/Form`)
  - Take create instance as an example `src/pages/compute/containers/Instance/actions/StepCreate/index.jsx` :
    - Includes 4 steps: Base configuration, Network configuration, System configuration, Confirm configuration

    ```javascript
    get steps() {
      return [
        {
          title: t('Base Config'),
          component: BaseStep,
        },
        {
          title: t('Network Config'),
          component: NetworkStep,
        },
        {
          title: t('System Config'),
          component: SystemStep,
        },
        {
          title: t('Confirm Config'),
          component: ConfirmStep,
        },
      ];
    }
    ```

- `onSubmit`
  - The request function of the action
  - After the action request is successful, will automatically jump to the resource list page
  - After the action fails, will display error prompts in the form page
  - Return `Promise`.
  - Return the function in the `store` that corresponding to the form.

## The attributes and functions that override in need

- `init`
  - Initial operation
  - Defines `this.store` in it, `loading` status is based on `this.store.isSubmitting`
  - Call the function to obtain other data required by the form in it
  - Update attributes in `this.state` .
  - Take create instance as an example `src/pages/compute/containers/Instance/actions/StepCreate/index.jsx` :
    - Get quota information

    ```javascript
    init() {
      this.store = globalServerStore;
      this.projectStore = globalProjectStore;
      this.getQuota();
    }
    ```

- `instanceName`
  - After the request is sent, the resource name in the prompt message
  - Default is `this.values.name`
  - Take create instance as an example `src/pages/compute/containers/Instance/actions/StepCreate/index.jsx` :
    - If is batch create instance, will display name in form of `${name}-${index + 1}`

    ```javascript
    get instanceName() {
      const { name, count = 1 } = this.values || {};
      if (count === 1) {
        return this.unescape(name);
      }
      return this.unescape(
        new Array(count)
          .fill(count)
          .map((_, index) => `${name}-${index + 1}`)
          .join(', ')
      );
    }
    ```

- `renderFooterLeft`
  - Rendering of internal left side of the bottom of the form
  - Default return `null`
  - src/pages/compute/containers/Instance/actions/StepCreate/index.jsx
    - Show the number of batch create
    - Based on the number of inputs and the remaining quota, determines if the current form is correct

    ```javascript
    renderFooterLeft() {
      const { data } = this.state;
      const { count = 1, source: { value: sourceValue } = {} } = data;
      const configs = {
        min: 1,
        max: sourceValue === 'bootableVolume' ? 1 : 100,
        precision: 0,
        onChange: this.onCountChange,
        formatter: (value) => `$ ${value}`.replace(/\D/g, ''),
      };
      return (
        <div>
          <span>{t('Count')}</span>
          <InputNumber
            {...configs}
            value={count}
            className={classnames(styles.input, 'instance-count')}
          />
          {this.renderBadge()}
        </div>
      );
    }
    ```

- `successText`
  - Successful prompt generated after the request

- `errorText`
  - Error prompt generated after the request fails
  - Generally do not need replication

- `renderFooterLeft`
  - Rendering function on the left side of the table

## The attributes and functions that do not need to be override

- `values`
  - After the form is verified successfully, use this value to update form value.

- `isAdminPage`
  - Whether current page is a "management platform" page

- `getRoutePath`
  - Generate function of page URL
  - Such as: need to provide a ability of jump to the associated resource, use this function, you can jump to the corresponding address of the `console platform` in the `console platform`, and jump to the corresponding address of the `management platform` in the `management platform`.

## The basic functions in the parent class

- `StepAction` extends `StepForm`
- Recommend to see `src/components/StepForm/index.jsx`
