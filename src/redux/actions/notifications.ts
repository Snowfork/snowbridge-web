import { toast } from "react-toastify";
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

export function notify(
  notification: Notification,
): AddNotificationPayload {
  const date = Date.now();
  notification.id = date;

    switch(notification.color){
	case 'success':
	    toast.success(notification.text);
	    break;
	case 'warning':
	    toast.warning(notification.text);
	    break;
	case 'error':
	    toast.error(notification.text);
	    break;
	default:
	    toast(notification.text);
    }
    
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
