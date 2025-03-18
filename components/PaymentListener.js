import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import { useRouter } from "next/router";

const PaymentListener = () => {
  const [message, setMessage] = useState("Đang chờ thanh toán...");
  const router = useRouter();
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

        if(data.status === 'completed') {
            console.log('Thanh toán thành công!');
            localStorage.removeItem('cart');
            router.push('/order-success');
        }
      });
      

    return () => {
      console.log("Unsubscribing...");
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [router]);

  return (
    <div>
      <h3 className="text-xl text-red-400">Trạng thái thanh toán: {message}</h3>
      <br/>
    </div>
  );
};

export default PaymentListener;
