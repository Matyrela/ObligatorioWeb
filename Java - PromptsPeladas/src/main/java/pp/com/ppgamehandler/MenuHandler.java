package pp.com.ppgamehandler;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import pp.com.ppgamehandler.game.GameManager;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class MenuHandler extends TextWebSocketHandler {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        System.out.println("Message received: " + message.getPayload());
        TextMessage response = new TextMessage("CantHandleThisRequest");
        if(message.getPayload().equals("getAvailableRooms")){
            response = new TextMessage(
                "{\"requestType\":\"RequestAviableRooms\",\"responseData\":[" +
                GameManager.getInstance().getGames() +
                "]}"
            );

            session.sendMessage(response);
        }
        System.out.println("Response sent: " + response.getPayload() + " because received message was: " + message.getPayload());
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        System.out.println("Connection established with: " + session.getId());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
        System.out.println("Connection closed with: " + session.getId());
    }
}
