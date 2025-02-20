import { useEffect, useState } from "react";
import Pusher from "pusher-js";

const PaymentListener = () => {
  const [message, setMessage] = useState("Đang chờ thanh toán...");

  useEffect(() => {
    Pusher.logToConsole = true;

    console.log("Pusher");
    const pusher = new Pusher("fa29644cbc3751aafe8d", {
      cluster: "ap1",
      forceTLS: true,
    });

    console.log(" Pusher instance:", pusher);

    pusher.connection.bind("connected", () => {
      console.log("Pusher đã kết nối thành công!");
    });

    pusher.connection.bind("error", (err) => {
      console.error("Lỗi kết nối Pusher:", err);
    });

    const channel = pusher.subscribe("payments");

    console.log("Đã subscribe vào channel:", channel);

    channel.bind("payment.updated", (data) => { 
        console.log("Nhận event từ Pusher:", data);
        setMessage(`Thanh toán: ${data.status}`);
      });
      

    return () => {
      console.log("Unsubscribing...");
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  return (
    <div>
      <h3>Trạng thái thanh toán:</h3>
      <p>{message}</p>
    </div>
  );
};

export default PaymentListener;
