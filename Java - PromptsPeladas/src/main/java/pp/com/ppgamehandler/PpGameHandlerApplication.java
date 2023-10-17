package pp.com.ppgamehandler;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import pp.com.ppgamehandler.game.Game;
import pp.com.ppgamehandler.game.GameManager;

@SpringBootApplication
public class PpGameHandlerApplication {

    public static void main(String[] args) {
        SpringApplication.run(PpGameHandlerApplication.class, args);

        GameManager.getInstance().addGame("Booggyto", "4", 20);
    }
}
