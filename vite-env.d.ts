declare namespace NodeJS {
  interface ProcessEnv {
    exame_key: string;
    [key: string]: string | undefined;
  }
}
