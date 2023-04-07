import axios, { AxiosRequestConfig } from 'axios';
// import { Toast } from 'vant';

let isShowError = true;

const FailCode: any = {
  1000001: (resData: any) => {
    // Toast("未登录或登录态失效");
    return Promise.reject(resData);
  },
  '-1': (resData: any) => {
    // Toast(resData.retmsg);
    return Promise.reject(resData);
  },
  default: (resData: any) => {
    // Toast(resData.retmsg);
    return Promise.reject(resData);
  },
};

const instance = axios.create({
  timeout: 60000,
});

instance.interceptors.request.use(
  function (config: AxiosRequestConfig<any>) {
    isShowError = !config.headers?.isHideError;
    return {
      ...config,
      headers: {
        // Authorization: '8be5db2ffa0a4acda60bd528b95d4ce4',
        ...config.headers,
      },
    };
  },
  function (error) {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  function (response) {
    const { headers, status, statusText, data, config } = response;
    if (status === 200) {
      // const { ret } = data;
      // if (ret !== 0 && !config.headers?.isHideError) {
      //   return FailCode[ret] ? FailCode[ret](data) : FailCode.default(data);
      // }
      console.log(`output->`, data);

      return data;
    } else {
      // isShowError && Toast(`接口出错：${config.url} [${status}]${statusText}`);
      return Promise.reject(response);
    }
  },
  function (error) {
    // isShowError && Toast(`接口出错：${error?.message}`);
    return Promise.reject(error);
  }
);

export const httpClient = instance;
