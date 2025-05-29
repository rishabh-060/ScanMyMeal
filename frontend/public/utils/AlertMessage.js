import swal from 'sweetalert';

const AlertMessage = (title, text) => {
    swal({
        title: title || "Success!",
        text: text,
        button: "OK",
    });
}

export default AlertMessage;