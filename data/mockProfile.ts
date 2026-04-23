/**
 * Моковые персональные данные профиля и терапевта.
 * Позже заменить на ответ API (профиль пользователя, связь с терапевтом).
 */

export type ProfileUserMock = {
  fullName: string;
  email: string;
  /** Отображаемая роль в приложении */
  roleLabel: string;
  /** С какой даты пользуется приложением (как приходит с бэка или форматируем на клиенте) */
  memberSinceLabel: string;
};

export type ProfileTherapistMock = {
  fullName: string;
  /** С какой даты клиент ведёт работу с этим терапевтом в приложении */
  linkedSinceLabel: string;
};

export const mockProfileUser: ProfileUserMock = {
  fullName: "Мария Иванова",
  email: "maria.example@mail.com",
  roleLabel: "Клиент",
  memberSinceLabel: "12 марта 2025",
};

export const mockProfileTherapist: ProfileTherapistMock = {
  fullName: "Анна Петрова",
  linkedSinceLabel: "3 апреля 2025",
};
