English | [Chinese](../../zh/develop/3-4-BaseDetailInfo-introduction.md)

# Application

![Details page](../../en/develop/images/detail/image-detail-info.png)

- The base class of components in the Details Tab of each resource detail page
- Left and right structure display
- Display in the form of Card
- The display of the page content can be completed by configuring the Card

# BaseDetailInfo Code file

- `src/containers/BaseDetail/index.jsx`

# BaseDetailInfo Introduction to attribute and function definitions

- Resource details are inherited from BaseDetailInfo
- Code location:`pages/xxxx/containers/XXXX/Detail/BaseDetail.jsx`
- Only need to copy some functions to complete the development of the page
- Attributes and functions are divided into the following four types,
  - The attributes and functions that usually need to be overridden mainly include:
    - Card list on the left
  - Functions and attributes for on-demand overridden, mainly include:
    - Card list on the right
    - Function to get data
    - Source of display data
  - Functions and attributes that do not need to be overridden, mainly include:
    - Whether the current page is a management platform page
  - The basic functions in the base class mainly include:
    - Render the page
  - See below for a more detailed and comprehensive introduction

## Card configuration

- The Cards on the left and right sides of the page use the same configuration
- The configuration of each Card is as follows,
  - `title`, required item, the title of the Card
  - `titleHelp`, optional, the prompt message displayed next to the title of the Card
  - `render`, optional, if it exists, the content of Card will be rendered based on `render`
  - `options`, options, the configuration list of each line in Card, each option configuration is as follows,
    - `label`, required item, label in the row
    - `dataIndex`, a required item, corresponding to the key in `this.detailData`, the default is to display the data in the row based on `dataIndex`
    - `render`, optional, can render the content in the line based on the result of `render`
    - `valueRender`, optional, based on `dataIndex` and `valueRender` to generate in-line display data
      - `sinceTime`, processing time, displayed as "XX hours ago"
      - `keepTime`, display the remaining time
      - `yesNo`, handle the `Boolean` value and display it as "yes" or "no"
      - `GBValue`, processing size, displayed as "XXXGB"
      - `noValue`, when there is no value, it is displayed as "-"
      - `bytes`, processing size
      - `uppercase`, uppercase
      - `formatSize`, processing size, such as "2.32 GB", "56.68 MB"
      - `toLocalTime`, processing time, shown as "2021-06-17 04:13:07"
      - `toLocalTimeMoment`, processing time, shown as "2021-06-17 04:13:07"
    - `copyable`, optional, whether the data in the row can be overridden, if it can be overridden, the copy icon will be displayed
- Take the keypair `src/pages/compute/containers/Keypair/Detail/BaseDetail.jsx` as an example

  ```javascript
  get keypairInfoCard() {
    const options = [
    {
      label: t('Fingerprint'),
      dataIndex: 'fingerprint',
    },
    {
      label: t('Public Key'),
      dataIndex: 'public_key',
      copyable: true,
    },
    {
      label: t('User ID'),
      dataIndex: 'user_id',
    },
    ];
    return {
      title: t('Keypair Info'),
      options,
    };
  }
  ```

## Properties and functions that usually need to be overridden

- `leftCards`:
  - The function must be overridden
  - Card list shown on the left
  - Take the mirror `src/pages/compute/containers/Image/Detail/BaseDetail.jsx` as an example

    ```javascript
    get leftCards() {
      const cards = [this.baseInfoCard, this.securityCard];
      return this.isImageDetail ? cards : [this.InstanceCard, ...cards];
    }
    ```

- `init`
  - Configure the function of the Store, in this function, configure the function used to process the data request
    Store, if this function is configured, it will initiate a data request when the page is displayed, but sometimes when the page is displayed, no additional request is required, just use `this.props.detail`
  - Generally used is the form of `new XXXStore()`
  - Take the mirror `src/pages/compute/containers/Image/Detail/BaseDetail.jsx` as an example

    ```javascript
    init() {
      this.store = new ImageStore();
    }
    ```

## Properties and functions for on-demand overridden

- `rightCards`
  - Card list shown on the right
- `fetchData`
  - Function to get Card data
  - Generally do not need to copy the function
- `detailData`
  - Data source of page Card
  - The default is `this.props.detail || toJS(this.store.detail)`
  - Generally do not need to copy the function
  - Take Qos of volume type `src/pages/storage/containers/VolumeType/QosSpec/Detail/index.jsx` as an example

    ```javascript
    get detailData() {
      return this.store.detail.qos_specs;
    }
    ```

## Properties and functions that do not need to be overridden

- `id`
  - `id` in routing information
- `isAdminPage`
  - Is the current page a "management platform" page
- `getRoutePath`
  - Function to generate page URL
  - For example, it is necessary to provide a jump function to the associated resource. Using this function, you can jump to the corresponding address of the console in the console, and jump to the corresponding address of the management platform in the management platform.
- `routing`
  - Routing information corresponding to the page
- `isLoading`
  - Whether the current page is updating data, the loading style will be displayed when updating

## Basic functions in the base class

- It is recommended to check the code understanding,`src/containers/BaseDetail/index.jsx`
