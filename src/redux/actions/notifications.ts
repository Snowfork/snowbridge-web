import { Notification } from '../reducers/notifications';
import {
  ADD_NOTIFICATION,
  REMOVE_NOTIFICATION,
} from '../actionsTypes/notifications';

export interface AddNotificationPayload {
  type: string;
  notification: Notification;
}

export interface RemoveNotificationPayload {
  type: string;
  id: number;
}

export function addNotification(
  notification: Notification,
): AddNotificationPayload {
  const date = Date.now();
  notification.id = date;

  return {
    type: ADD_NOTIFICATION,
    notification,
  };
}
export function removeNotification(id: number): RemoveNotificationPayload {
  return {
    type: REMOVE_NOTIFICATION,
    id: id,
  };
}
