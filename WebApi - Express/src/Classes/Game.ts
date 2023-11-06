import { Activity } from "./Activity";
import { Player } from "./Player";

export class Game {
  id: string;
  name: string;
  players: Player[];
  status: Status;
  adminPlayer!: Player;

  ws: any;
  url: string = "";

  activities: Activity[] = [];
  currentActivity: Activity | undefined;

  public started: boolean = false;

  constructor(name: string, id: string, ws: any) {
    this.activities = [
        new Activity(1, "Nestor", "Marcas de autos"),
        new Activity(2, "Martin", "Nombres de bizcochos"),
        new Activity(3, "Linda", "Platillos típicos de Argentina"),
        new Activity(4, "Juan Pablo", "Bandas de rock"),
        new Activity(5, "Maria", "Juegos de mesa populares"),
        new Activity(6, "Ravi", "Películas de ciencia ficción"),
        new Activity(7, "Ming", "Culturas y sus festivales"),
        new Activity(8, "Emma", "Canciones de amor famosas"),
        new Activity(9, "Diego", "Bebidas alcohólicas icónicas"),
        new Activity(10, "Sakura", "Literatura clásica mundial"),
        new Activity(11, "Carlos", "Bailarines de salsa famosos"),
        new Activity(12, "Jorge", "Juegos Olímpicos modernos"),
        new Activity(13, "Sophia", "Actores de cine de Hollywood"),
        new Activity(14, "Amina", "Países que han ganado la Copa del Mundo de fútbol"),
        new Activity(15, "Eduardo", "Pintores famosos"),
        new Activity(16, "Hiroshi", "Platillos típicos de Japón"),
        new Activity(17, "Olivia", "Bandas de rock de los 80"),
        new Activity(18, "Mikhail", "Videojuegos más vendidos de todos los tiempos"),
        new Activity(19, "Carmen", "Premios Nobel de Literatura"),
        new Activity(20, "Ali", "Científicos influyentes"),
        new Activity(21, "Katya", "Culturas precolombinas de América"),
        new Activity(22, "Luigi", "Películas de terror clásicas"),
        new Activity(23, "Tatiana", "Bebidas tradicionales de Rusia"),
        new Activity(24, "David", "Astronautas famosos"),
        new Activity(25, "Isabella", "Juegos de cartas populares")
    ];

    this.id = id;
    this.name = name;
    this.players = new Array<Player>();
    this.status = Status.WAITING;
    this.ws = ws;

    this.url = "/games/ws/" + this.id;

    ws.of(this.url).on("connection", (socket: any) => {
      ws.of(this.url).emit("playerList", this.players);

      //--------------------------------------------------------------------------------

      socket.on("chatMessage", (data: { [key: string]: any }) => {
        ws.of(this.url).emit("chatMessage", data);
      });

      socket.on("clientChangeStatus", (data: { [key: string]: any }) => {
        ws.of(this.url).emit("clientChangeStatus", data);
      });

      socket.on("startGame", (data: { [key: string]: any }) => {
        if (data.name == this.adminPlayer.name) {
          this.started = true;
          ws.of(this.url).emit("startGame");

          setTimeout(() => {
            this.currentActivity =
              this.activities[
                Math.floor(Math.random() * this.activities.length)
              ];
            this.activities = this.activities.filter((value) => {
              return value !== this.currentActivity;
            });
            this.startAnswerTimer();
            return;
          }, 5000);
        }
      });

      socket.on("currentActivity", (data: { [key: string]: any }) => {
        if (this.currentActivity != undefined)
          ws.of(this.url).emit("currentActivity", this.currentActivity);
      });
    });
  }

  public startAnswerTimer() {
    console.log(this.activities.length);
    console.log(this.currentActivity);

    if (this.activities.length == 0) {
      console.log("SE ACABO");
    } else {
      let timer = 30;
      this.ws.of(this.url).emit("currentActivity", this.currentActivity);
      setTimeout(() => {
        //ESTE PRIMER TIMEOUT ES PARA LA ANIMACION EN EL HTML
        let x = setInterval(() => {
            if (timer == 0) {
              this.currentActivity = this.activities[Math.floor(Math.random() * this.activities.length)];
              this.activities = this.activities.filter((value) => {
                return value !== this.currentActivity;
              });
              this.ws.of(this.url).emit("timer",{'timer' : "¡SE ACABO!"});
              setTimeout(() => {
                this.startAnswerTimer();
              }, 2000);
              clearInterval(x);
              return;
            }else{
                this.ws.of(this.url).emit("timer",{'timer' : timer});
                timer--;
            }
          }, 1000);
      }, 3000);
    }
  }

  public addPlayer(player: Player) {
    if (this.players.length == 0) this.adminPlayer = player;
    this.players.push(player);
  }

  public removePlayer(player: Player) {
    let adminWasChanged = false;

    this.players = this.players.filter((value) => {
      return value !== player;
    });

    if (player === this.adminPlayer) {
      if (this.players.length > 0) {
        adminWasChanged = true;
        this.adminPlayer =
          this.players[Math.floor(Math.random() * this.players.length)];
      }
    }

    setTimeout(() => {
      this.ws.of(this.url).emit("playerList", this.players);
      if (adminWasChanged)
        this.ws.of(this.url).emit("adminChange", this.adminPlayer);
    }, 1000);
  }

  public sendChatMessage(message: string) {
    setTimeout(() => {
      this.ws
        .of(this.url)
        .emit("chatMessage", { server: true, message: message });
    }, 1000);
  }
}

export enum Status {
  WAITING,
  PLAYING,
  FINISHED,
}
