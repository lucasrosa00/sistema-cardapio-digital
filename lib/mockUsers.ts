export interface MockUser {
  id: number;
  restaurantName: string;
  login: string;
  password: string;
  url: string;
}

export const mockUsers: MockUser[] = [
  { id: 1, restaurantName: "Corrêa's Bar", login: "correa", password: "123", url: "correas_bar" },
  { id: 2, restaurantName: "Pizzaria Bella Napoli", login: "napoli", password: "456", url: "bella_napoli" },
];

export const getUserByUrl = (url: string): MockUser | null => {
  const user = mockUsers.find((u) => u.url === url);
  return user || null;
};

export const validateLogin = (login: string, password: string): MockUser | null => {
  const user = mockUsers.find(
    (u) => u.login === login && u.password === password
  );
  return user || null;
};

