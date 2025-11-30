export interface IAlertNotificationService {
  showAlert(correlationId: number): Promise<void>;
}
