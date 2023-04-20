import { getTaskStatusTypes, getTaskList, fetchTaskLevel, fetchTrackerTypes } from '@/apis';
import { computed, ref, onMounted, reactive, unref } from 'vue';
import { TaskItem, SidePanelMapType } from '@/types';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores';

export const useTaskBusiness = () => {
  const route = useRoute();
  const router = useRouter();
  const userStore = useUserStore();
  const projectId = route.params.projectId;
  const taskList = ref();
  const searchTaskList = ref(); // 根据标题收索
  const filterList = ref(); // 根据侧边面板筛选
  const levels = ref();
  const activePanelMenu = reactive({
    field: 'all',
    value: '',
  });
  const searchTask = (params: {
    id?: number;
    subject: string;
    // author: number;
    // assigned_to_id: number;
  }) => {
    const str = new RegExp(`${params.subject}`, 'g');
    searchTaskList.value = filterList.value.filter((item: TaskItem) => {
      return item.subject.includes(params.subject);
      // str.test(item.subject);
    });
    if (!params.subject) searchTaskList.value = filterList.value;
  };
  // else taskList.value = [];

  // : { author?: number; assigned_to_id?: number }
  const filterTask = (fieldItem?: { field: string; value: string }) => {
    if (fieldItem?.field && fieldItem?.field) {
      activePanelMenu.field = fieldItem.field;
      activePanelMenu.value = fieldItem.value;
    }
    if (activePanelMenu.field == 'all') filterList.value = taskList.value;
    else
      filterList.value = taskList.value.filter((item: TaskItem) => {
        return item[activePanelMenu.field] === fieldItem.value;
      });
  };

  function multiFilter(array, filters) {
    const filterKeys = Object.keys(filters);
    console.log(`output->filters`, filters);
    // filters all elements passing the criteria
    return array.filter((item) => {
      // dynamically validate all filter criteria
      const arr = filters.every((filter) => {
        //ignore when the filter is empty Anne
        if (typeof filter.type.value === 'undefined') return true;
        console.log(
          `output->filters[key]`,
          filter.flag,
          filter.type.value,
          item[filter.type.field],
          filter.type.value === item[filter.type.field],
          filter.type.value !== item[filter.type.field]
        );
        return filter.flag
          ? filter.type.value === item[filter.type.field]
          : filter.type.value !== item[filter.type.field];
      });
      return arr;
    });
  }
  function multiFilter2(array, filters) {
    // filters all elements passing the criteria
    return array.filter((item) => {
      // dynamically validate all filter criteria
      const arr = filters.some((filter) => {
        //ignore when the filter is empty Anne
        // if (!filterKeys.length) return true;
        if (typeof filter.type.value === 'undefined') return true;

        console.log(
          `output->filters[key]`,
          filter.flag,
          filter.type.value,
          item[filter.type.field],
          filter.type.value === item[filter.type.field]
        );
        if (filter.flag === 0 || filter.flag === 1)
          return filter.flag
            ? filter.type.value === item[filter.type.field]
            : filter.type.value !== item[filter.type.field];
        // if (dateFlag === 2)
        //   item[key].flag
        //     ? !!~filters[key].value === item[key]
        //     : !!~filters[key].value !== item[key];
      });
      return arr;
    });
  }
  // [{
  //   flag: value.flag.value,
  //   orAnd: value.orAndFlag.value,
  //   type: value.type,
  // }]
  const multFilterType = (params) => {
    console.log(`output->params`, params);
    // if (activePanelMenu.value !== 'all' && params.length === 1)

    const resetFlag = params.every((param) => !param.type.value);
    //
    if (resetFlag) {
      filterTask({ field: activePanelMenu.field, value: activePanelMenu.value });
      return false;
    }
    // // 1 且 0 或
    const one = params.length === 1 ? 'and' : params[1]?.orAnd;
    if (one === 'and') {
      filterTask({ field: activePanelMenu.field, value: activePanelMenu.value });
      const list = multiFilter(filterList.value, params);

      console.log(`output->list one1`, one, list);
      filterList.value = list;
    } else {
      // or
      filterTask({
        field: activePanelMenu.field,
        value: activePanelMenu.value,
      });
      const list = multiFilter2(filterList.value, params);
      console.log(`output->list one2 `, list);
      filterList.value = list;
    }
  };

  const fetchTask = async () => {
    const taskResp = await getTaskList({
      pid: projectId,
      token: localStorage.getItem('token'),
      sort: 'status:desc',
    });
    taskList.value = taskResp.issues;
    filterList.value = taskResp.issues;
  };

  const trackers = ref();
  // 获取任务类型
  const getTrackerTypes = async () => {
    const resp = await fetchTrackerTypes({
      token: localStorage.getItem('token'),
      pid: projectId,
    });
    trackers.value = resp.tracker;
  };
  const getTaskLevel = async () => {
    const resp = await fetchTaskLevel({
      token: localStorage.getItem('token'),
      pid: projectId,
    });
    levels.value = resp.priority;
  };
  const status = ref();
  const taskStatusTypes = async () => {
    const resp = await getTaskStatusTypes({
      token: localStorage.getItem('token'),
    });
    status.value = resp.tracker;
    // taskBoard.statusType = resp.tracker;
  };
  return {
    searchTask,
    fetchTask,
    searchTaskList,
    initTaskList: taskList,
    getTaskLevel,
    getTrackerTypes,
    taskStatusTypes,
    trackers,
    levels,
    status,
    filterTask,
    filterList,
    multFilterType,
  };
};
