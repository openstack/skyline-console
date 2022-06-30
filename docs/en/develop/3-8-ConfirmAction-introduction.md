English | [简体中文](../../zh/develop/3-8-ConfirmAction-introduction.md)

# Usage

![Confirm](../../zh/develop/images/form/confirm.png)

- After click the action button, the confirm modal will display.
- After click the `Confirm` button, the `loading` status will be displayed according to the status of request.
- After click the `Cancel` button, the modal form will disappear.
- If the request is sent successfully, a prompt message of successful action will be displayed in the upper right corner, and it will automatically disappear after a few seconds.
- If the request fails, an error message will be displayed in the upper right corner of the form page, which can only disappear after clicking the close button.
- Support batch action, after selecting multiple items in the table, you can click the action button above the table to perform batch action.
- When using batch action, the resources that do not meet the action conditions among the resources selected in batch will be prompted.

# ConfirmAction code file

- `src/containers/Action/ConfirmAction/index.jsx`

# ConfirmAction attribute and function definitions introduction

- ConfirmAction are all inherited from `ModalAction` component
- Code location: `pages/xxxx/containers/XXXX/actions/xxx.jsx`
- For some action, it it only need to confirm again, user don't need to input more information. ConfirmAction can be used at this time, such as: shut down the instance.
- Only need to override some functions and the development of page will be completed
- Attributes and functions are divided into the following four types:
  - The attributes and functions that must be override, mainly include:
    - Action ID
    - Action title
    - Action permissions
    - Judgment whether to disable the action button
    - Function to send request
  - The attributes and functions that override in need, mainly include:
    - Resource name
    - Whether to display the resource name in the prompt of the request result
    - Whether it is an asynchronous action
    - Action button text
  - The attributes and functions that do not need to be override, mainly include:
    - Whether the current page is a admin page
  - The basic functions in the parent class, mainly include:
    - Render page
    - Display of request status
    - Display of request results
- See below for a more detailed and comprehensive introduction

## The attributes and functions that must be override

- `id`
  - Resource action ID
  - Need to be unique, only for all actions in the `actions` of the resource to be unique
  - Must be override
  - Take stop instance as an example `src/pages/compute/containers/Instance/actions/Stop.jsx` :

    ```javascript
    get id() {
      return 'stop';
    }
    ```

- `title`
  - Resource action title
  - Take stop instance as an example `src/pages/compute/containers/Instance/actions/Stop.jsx` :

    ```javascript
    get title() {
      return t('Stop Instance');
    }
    ```

- `actionName`
  - The action name
  - Use the name in the prompt after the request
  - Take stop instance as an example `src/pages/compute/containers/Instance/actions/Stop.jsx` :

    ```javascript
    get actionName() {
      return t('stop instance');
    }
    ```

- `policy`
  - Action permission, if the permission verify failed, the action button will not be displayed on the resource list page. (Fill in the policy that complies with the openstack rules here)
  - Take stop instance as an example `src/pages/compute/containers/Instance/actions/Stop.jsx` :

    ```javascript
    policy = 'os_compute_api:servers:stop';
    ```

- `aliasPolicy`
  - Action permission, if the permission verify failed, the action button will not be displayed on the resource list page. (Fill in the custom policy with module prefix here)
  - Take stop instance as an example `src/pages/compute/containers/Instance/actions/Stop.jsx` :

    ```javascript
    aliasPolicy = 'nova:os_compute_api:servers:stop';
    ```

- `allowedCheckFunc`
  - Determine whether the action button needs to be disabled
  - Return `Boolean`
  - Button that no need to be disabled, write directly:

    ```javascript
    allowedCheckFunc = () => true;
    ```

  - Param `item`, the data corresponding to the action.
  - Take stop instance as an example `src/pages/compute/containers/Instance/actions/Stop.jsx` :
    - The action button will be shown when the instance is running and is not lock in console or is under admin page.

    ```javascript
    allowedCheckFunc = (item) => {
      if (!item) {
        return true;
      }
      return isNotLockedOrAdmin(item, this.isAdminPage) && this.isRunning(item);
    };
    ```

- `onSubmit`
  - The request function of the action
  - After the action request is successful, the modal will disappear, and a successful prompt will be displayed, and the prompt will disappear after a few seconds
  - After the action fails, the modal will disappear and an error message will be displayed. You need to close the prompt manually before the prompt disappears.
  - Return `Promise`.
  - Return the function in the `store` that corresponding to the form.
  - Take stop instance as an example `src/pages/compute/containers/Instance/actions/Stop.jsx` :

    ```javascript
    onSubmit = (item) => {
      const { id } = item || this.item;
      return globalServerStore.stop({ id });
    };
    ```

## The attributes and functions that override in need

- `buttonText`
  - When the text on the action button is inconsistent with the title of the modal, this attribute needs to be override
  - Take stop instance as an example `src/pages/compute/containers/Instance/actions/Stop.jsx` :
    - The title of modal is `stop instance`, the text on button is `stop`.

    ```javascript
    get buttonText() {
      return t('Stop');
    }
    ```

- `buttonType`
  - The type of button, support `primary`, `danger`, `default`
  - Default is `default`
  - Take reset setting value as an example `src/pages/configuration/containers/Setting/actions/Reset.jsx`

    ```javascript
    get buttonType() {
      return 'primary';
    }
    ```

- `isDanger`
  - Support boolean `false`, `true`, the default value is `false`
  - When the button is to emphasize the risk of action, the button or the text on the button is generally red, use `danger`
  - Take stop instance as an example `src/pages/compute/containers/Instance/actions/Stop.jsx` :

    ```javascript
    get isDanger() {
      return 'danger';
    }
    ```

- `passiveAction`
  - In batch action, if a resource does not meet the conditions, the prompt will be displayed before the request is sent. If the prompt needs to be in a passive voice, this attribute needs to be set.
  - Take stop instance as an example `src/pages/compute/containers/Instance/actions/Stop.jsx` :

    ```javascript
    get passiveAction() {
      return t('be stopped');
    }
    ```

- `isAsyncAction`
  - Whether the current action is an asynchronous action
  - Default is `false`
  - If is asynchronous action, the prompt will be : `The xxx instruction has been issued, instance: xxx. \n You can wait for a few seconds to follow the changes of the list data or manually refresh the data to get the final display result.`
  - If is synchronous action, the prompt will be : `xxx successfully, instance: xxx.`
  - Take stop instance as an example `src/pages/compute/containers/Instance/actions/Stop.jsx` :

    ```javascript
    get isAsyncAction() {
      return true;
    }
    ```

- `messageHasItemName`
  - Whether to include the instance name in the prompt of the request result
  - Default is `true`
  - For some resources without `name` attribute, you can set the value `false`

- `performErrorMsg`
  - In batch action, if a resource does not meet the conditions, a prompt will be displayed before the request is sent
  - Default is `Unable to xxx, instance: xxx.`
  - Take stop instance as an example `src/pages/compute/containers/Instance/actions/Stop.jsx` :
    - If the instance selected is not running, it will prompt `Instance "{ name }" status is not in active or suspended, can not stop it.`
    - If the instance selected is locked, it will prompt `Instance "{ name }" is locked, can not stop it.`
    - Other case, will all prompt `You are not allowed to stop instance "{ name }".`

    ```javascript
    performErrorMsg = (failedItems) => {
      const instance = isArray(failedItems) ? failedItems[0] : failedItems;
      let errorMsg = t('You are not allowed to stop instance "{ name }".', {
        name: instance.name,
      });
      if (!this.isRunning(instance)) {
        errorMsg = t(
          'Instance "{ name }" status is not in active or suspended, can not stop it.',
          { name: instance.name }
        );
      } else if (!isNotLockedOrAdmin(instance, this.isAdminPage)) {
        errorMsg = t('Instance "{ name }" is locked, can not stop it.', {
          name: instance.name,
        });
      }
      return errorMsg;
    };
    ```

- `getNameOne`
  - The instance name in the prompt
  - Default is :

    ```javascript
    getNameOne = (data) => data.name;`
    ```

  - Param `data` is the resource that the action corresponding to
  - Take release fip as an example `src/pages/network/containers/FloatingIp/actions/Release.jsx` :

    ```javascript
    getNameOne = (data) => data.floating_ip_address;
    ```

- `getName`
  - It is not recommended to override this function
  - It is recommended to override `getNameOne`

- `confirmContext`
  - The prompt in the confirm modal
  - Default is `Are you sure to {action} (instance: {name})?`
  - Take delete flavor as an example `src/pages/compute/containers/Flavor/actions/Delete.jsx` :
    - Prompt `If an instance is using this flavor, deleting it will cause the instance's flavor data to be missing. Are you sure to delete {name}?`

    ```javascript
    confirmContext = (data) => {
      const name = this.getName(data);
      return t(
        "If an instance is using this flavor, deleting it will cause the instance's flavor data to be missing. Are you sure to delete {name}?",
        { name }
      );
    };
    ```

- `submitErrorMsg`
  - Error message after action failed
  - Generally do not need to override
  - Default is `Unable to {action}, instance: {name}.`

## The attributes and functions that do not need to be override

- `isAdminPage`
  - Whether current page is a "management platform" page
- `submitSuccessMsg`
  - Successful prompt generated after the request
- `submitErrorMsgBatch`
  - The error prompt after batch action request
- `perform`
  - In batch action, determine whether the selected data is operable, and if it is not operable, give corresponding prompts

## The basic functions in the parent class

- Recommend to see `src/containers/Action/ConfirmAction/index.jsx`
