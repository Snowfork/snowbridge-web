import {
  ADD_NOTIFICATION,
  REMOVE_NOTIFICATION,
} from '../actionsTypes/notifications';
import {
  AddNotificationPayload,
  RemoveNotificationPayload,
} from '../actions/notifications';

export type NotificationColor = 'success' | 'warning' | 'error' | 'default';

export interface Notification {
  text: string;
  color?: NotificationColor;
  id?: number;
}

export interface NotificationState {
  all: Notification[];
}

const initialState: NotificationState = {
  all: [],
};

function notificationsReducer(
  state: NotificationState = initialState,
  action: any,
) {
  switch (action.type) {
    case ADD_NOTIFICATION: {
      return ((action: AddNotificationPayload) => {
        return Object.assign({}, state, {
          all: [...state.all, action.notification],
        });
      })(action);
    }
    case REMOVE_NOTIFICATION: {
      return ((action: RemoveNotificationPayload) => {
        return Object.assign({}, state, {
          all: state.all.filter((n: Notification) => n.id !== action.id),
        });
      })(action);
    }
    default:
      return state;
  }
}

export default notificationsReducer;
