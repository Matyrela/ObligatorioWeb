import { Activity } from "./Activity";
import { Player } from "./Player";
import { Utils } from "./Utils";

export class Game {
  id: string;
  name: string;
  players: string[];
  status: Status;
  adminPlayer!: string;
  maxActivities: number = 0;
  playerPoints : Map<string,number> = new Map<string,number>();
  gameWinner : string = "";
  winnerPoints : number = 0;

  ws: any;
  url: string = "";

  activities: Activity[] = [];
  activityPlayer : any[] = [];
  answers: any[] = [];
  public started: boolean = false;

  stage: number = 0;
  timer: number = 30;
  votes: number = 0;
  constructor(name: string, id: string, ws: any) {
    this.activities = [
      new Activity(1, "Nestor", "Adjetivos calificativos que describan a la mama del gonza"),
      new Activity(2, "Martin", "A que se asemeja el olor de patas de flou?"),
      new Activity(3, "Linda", "Que es lo que mas le gusta a la mama del gonza?"),
      new Activity(4, "Juan Pablo", "Mejores lugares para tener relaciones en un barril (enzorriles)"),
      new Activity(5, "Maria", "Que pasaría si enzo se corta el pelo? (solo respuestas incorrectas)"),
      new Activity(6, "Ravi", "¿Porque el Gonza no se baña?"),
      new Activity(7, "Ming", "Zonas erógenas de la mama del gonza"),
      new Activity(8, "Emma", "Olores que salen de la casa del gonza"),
      new Activity(9, "Diego", "Cual es el peor olor que emite flou?"),
      new Activity(10, "Sakura", "Que es lo que usa Enzo para lavarse el cabello?"),
      new Activity(11, "Carlos", "lugares donde se puede encontrar a la mama del Pablo"),
    ];

    this.id = id;
    this.name = name;
    this.players = new Array<string>();
    this.status = Status.WAITING;
    this.ws = ws;

    this.url = "/games/ws/" + this.id;

    ws.of(this.url).on("connection", (socket: any) => {
      ws.of(this.url).emit("playerList", this.players);
      if (this.started) {
        //Este if existe para que cuando alguien recargue la pagina o se reconecte, el juego pueda actualizarle las cosas al cliente que se reconecto.
        socket.emit("activityPlayer", { 'activityPlayer': this.activityPlayer });
        socket.emit("stage", { "stage": this.stage });
        socket.emit("timer", { 'timer': this.timer });
        socket.emit("winner", { "playerWinner": this.gameWinner, "points": this.winnerPoints })
        if (this.stage == 2) {
          socket.emit("answerActivities", { "answerActivities": this.answers, "toAnswer": (this.maxActivities - 2) });
        }
      }

      //--------------------------------------------------------------------------------

      socket.on("chatMessage", (data: { [key: string]: any }) => {
        ws.of(this.url).emit("chatMessage", data);
      });

      socket.on("clientChangeStatus", (data: { [key: string]: any }) => {
        ws.of(this.url).emit("clientChangeStatus", data);
      });

      socket.on("startGame", (data: { [key: string]: any }) => {
        if (data.name == this.adminPlayer) {
          this.started = true;
          ws.of(this.url).emit("startGame");

          this.getActivities();
          
          setTimeout(() => {
            this.ws.of(this.url).emit("activityPlayer", {'activityPlayer' : this.activityPlayer});
            this.startAnswerTimer();
            return;
          }, 5000);
        }
      });

      socket.on("submitAnswer", (data: { [key: string]: any }) => {
        this.answers.push(data['activities']);
        this.answers.push(data['userName']);
        this.answers.push(data['answer']);
        this.votes++;
        /*this.answers.forEach(element => {
          console.log(element);
        });*/
      });

      socket.on("scorePoint", (data: { [key: string]: any }) => {
          let name = data['userName'];
          //suma un punto a la persona que gano
          let points = this.playerPoints.get(name);
          if (points != undefined){
            this.playerPoints.set(name,points+1); 
          }
        });
    });
  }

  public startAnswerTimer() {
    if (this.stage == 2) {
      console.log('answers: ', this.answers);
      this.ws.of(this.url).emit("answerActivities", { "answerActivities": this.answers, "toAnswer": (this.maxActivities-2) });
    }

    if (this.stage == this.maxActivities) {
      this.gameWinner = Array.from(this.playerPoints.keys())[0];
      Array.from(this.playerPoints.keys()).forEach(element => {
        let points = this.playerPoints.get(element);
        if (points != undefined){
          if (points > this.winnerPoints){
            this.gameWinner = element;
            this.winnerPoints = points;
          }
        }
        
      });
      console.log('Winner: ' + this.gameWinner + 'Con ' + this.winnerPoints + ' puntos');
      this.players.forEach(element => {
        this.removePlayer(new Player(element));
      });
      this.ws.of(this.url).emit("winner", { "playerWinner": this.gameWinner, "points": this.winnerPoints })

      return;
    } 

    else {
      this.ws.of(this.url).emit("newStage");
      this.ws.of(this.url).emit("stage", { "stage": this.stage });
      let x = setInterval(() => {
        if (this.timer > 0 && this.votes < this.players.length) {
          this.timer--;
          this.ws.of(this.url).emit("timer", { 'timer': this.timer });
        } else {
          this.ws.of(this.url).emit("timer", { 'timer': "¡Se acabó el tiempo!" });
          clearInterval(x);
          setTimeout(() => {
            this.stage++;
            this.timer = 30;
            this.votes = 0;
            this.startAnswerTimer();
          }, 2000);
        }

        }, 1000);
    }
  }
  public addPlayer(player: Player) {
    if (this.players.length == 0) this.adminPlayer = player.name;
    this.players.push(player.name);
    this.playerPoints.set(player.name,0);
  }

  public removePlayer(player: Player) {
    let adminWasChanged = false;
    this.playerPoints.delete(player.name);
    this.players = this.players.filter((pl) => {
      return pl !== player.name;
    });
    

    if (player.name === this.adminPlayer) {
      if (this.players.length > 0) {
        adminWasChanged = true;
        this.adminPlayer = this.players[Math.floor(Math.random() * this.players.length)];
      }
    }

    this.ws.of(this.url).emit("playerList", this.players);

    setTimeout(() => {
      if (adminWasChanged){
        this.ws.of(this.url).emit("adminChange", {'name': this.adminPlayer});
      }
    }, 1000);

    this.ws.of(this.url).emit("playerList", this.players);
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
  
    //this.maxActivities = Math.min(this.players.length, this.activities.length);
    this.maxActivities = this.players.length;
    //this.ws.of(this.url).emit("maxActivities", { 'maxActivities': this.maxActivities });
    for (let i = 0; i < this.maxActivities; i++) {
      let j = (i + 1) % this.maxActivities;
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
