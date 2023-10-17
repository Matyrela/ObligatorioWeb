package pp.com.ppgamehandler.game;

import java.util.ArrayList;
import java.util.List;

public class Game {
    String name;
    String id;
    int maxPlayers;
    List<Player> players;

    public Game(String name, String id, int maxPlayers) {
        this.name = name;
        this.id = id;
        this.maxPlayers = maxPlayers;
        this.players = new ArrayList<Player>();
    }
}
