module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest"
  },
  transformIgnorePatterns: ['/node_modules/(?!(axios)/)'],
  moduleFileExtensions: ["js","jsx","json","node"],
  moduleNameMapper: {
    // Стили подменяем на identity-obj-proxy
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    // Все картинки подставляем в тестах из __mocks__/fileMock.js
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.js"
  }
};
