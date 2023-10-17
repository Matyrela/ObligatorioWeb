package pp.com.ppgamehandler.game;

import java.util.HashMap;

public class GameManager {

    private static GameManager instance;

    public static GameManager getInstance() {
        if(instance == null){
            instance = new GameManager();
        }
        return instance;
    }

    HashMap<String, Game> games = new HashMap<>();

    public String getGames(){
        if(games.isEmpty()){
            return "";
        }

        String response = "";
        for(Game game : games.values()){
            response += "{\"name\":\"" + game.name + "\",\"id\":\"" + game.id + "\",\"maxPlayers\":\"" + game.maxPlayers + "\",\"players\":[";
            if(game.players.size() > 0){
                for(Player player : game.players){
                    response += "{\"name\":\"" + player.name + "\"},";
                }
                response = response.substring(0, response.length() - 1);
            }
            response += "]},";
        }
        response = response.substring(0, response.length() - 1);
        return response;
    }

    public void addGame(String name, String id, int maxPlayers){
        games.put(id, new Game(name, id, maxPlayers));
    }


}
