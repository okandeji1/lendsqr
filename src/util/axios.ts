import axios from 'axios';

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    if (error.response?.data) {
      return Promise.reject({
        ...error.response.data,
        statusCode: error.response.status,
      });
    } else if (error.request) {
      return Promise.reject({ ...error.request, statusCode: error.response });
    } else {
      return Promise.reject(error);
    }
  },
);

export default axios;
