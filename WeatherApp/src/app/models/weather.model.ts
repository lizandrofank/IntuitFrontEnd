export interface WeatherData {
    city: string;
    forecast: {
      date: string;
      temp_min: number,
      temp_max: number,
      humidity: number,
      rainProbability: string,
    }[];
  }

  export interface DayCurrent{
    city: string,
    lat : number,
    lon : number,
    temp_min: number,
    temp_max: number,
    humidity: number,
    rainProbability: string,
  }
  export interface WeatherDataHistory{
    city :string,
    date : string,
    temp_min: number,
    temp_max: number,
    humidity: number,
    rainProbability: string,
  }