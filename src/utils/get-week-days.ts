interface IGetWeekDaysParams {
  short?: boolean;
}

export function getWeekDay({ short = false }: IGetWeekDaysParams = {}) {
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
  });

  // Tenta converter uma estrutura iterável em um array
  // keys -> retorna o índice
  // Date.UTC ->
  return Array.from(Array(7).keys())
    .map(day => formatter.format(new Date(Date.UTC(2021, 5, day))))
    .map(weekDay => {
      if (short) {
        return weekDay.substring(0, 3).toUpperCase();
      }

      return weekDay.substring(0, 1).toUpperCase().concat(weekDay.substring(1));
    });
}
