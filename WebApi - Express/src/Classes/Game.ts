import { Activity } from "./Activity";
import { Player } from "./Player";
import { Utils } from "./Utils";

export class Game {
  id: string;
  name: string;
  players: Player[];
  status: Status;
  adminPlayer!: Player;

  ws: any;
  url: string = "";

  activities: Activity[] = [];
  activityPlayer : any[] = [];
  answers: any[] = [];
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
      if (this.started) {
        socket.emit("activityPlayer", { 'activityPlayer': this.activityPlayer });
        socket.emit("stage", { "stage": this.stage });
        socket.emit("timer", { 'timer': this.timer });
      }

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

          this.getActivities();
          
          setTimeout(() => {
            this.ws.of(this.url).emit("activityPlayer", this.activityPlayer);
            this.startAnswerTimer();
            return;
          }, 5000);
        }
      });
      socket.on("submitAnswer", (data: { [key: string]: any }) => {
        console.log(data['userName']);
        this.answers.push(data['userName']);
        this.answers.push(data['answer']);
        this.answers.forEach(element => {
          console.log(element);
        });
      });
    });
  }

  stage: number = 0;
  timer: number = 30;

  public startAnswerTimer() {
    if (this.stage == 2) {
      console.log("TERMINO");
      this.ws.of(this.url).emit("stage", { "stage": this.stage })
      return;
    } else {
      this.ws.of(this.url).emit("newStage");
      this.ws.of(this.url).emit("stage", { "stage": this.stage });
      let x = setInterval(() => {
        if (this.timer > 0) {
          this.timer--;
          this.ws.of(this.url).emit("timer", { 'timer': this.timer });
        } else {
          this.ws.of(this.url).emit("timer", { 'timer': "¡Se acabó el tiempo!" });
          clearInterval(x);
          setTimeout(() => {
            this.stage++;
            this.timer = 30;
            this.startAnswerTimer();
          }, 2000);
        }

      }, 1000);
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
  private getActivities() {
    Utils.shuffle(this.players);
    Utils.shuffle(this.activities);
  
    const maxActivities = Math.min(this.players.length, this.activities.length);
  
    for (let i = 0; i < maxActivities; i++) {
      let j = (i + 1) % maxActivities;
      this.activityPlayer.push(this.activities[i])
      this.activityPlayer.push(this.players[i])
      this.activityPlayer.push(this.players[j])
      }
    }
  }

export enum Status {
  WAITING,
  PLAYING,
  FINISHED,
}
