const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session'); // Importe o express-session
const nodemailer = require('nodemailer'); // Importe o nodemailer

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// Configuração da conexão com o banco de dados
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'bancoportaldasa',
});

// Conectar ao banco de dados
db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados: ' + err.stack);
    return;
  }
  console.log('Conexão com o banco de dados estabelecida como ID ' + db.threadId);
});

// Configure o middleware de sessão
app.use(session({
  secret: 'joaogui', // Substitua por uma chave secreta real
  resave: true,
  saveUninitialized: true
}));

// Configure o nodemailer para envio de e-mails
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'jgpretti2002@gmail.com',
    pass: 'azlr oqqn sypb yfnt',
  },
});


// Rota para o formulário de registro
app.get('/registro', (req, res) => {
  res.sendFile(__dirname + '/registro.html');
});

// Rota para processar o registro
app.post('/processa_registro', (req, res) => {
  const username = req.body.nome;
  const password = req.body.senha;
  const confirmpassword = req.body.confirmpassword;
  const email = req.body.email;
  const telefone = req.body.phone;

  if (!username || !password || !confirmpassword || !email || !telefone) {
    res.send('Todos os campos devem ser preenchidos.');
    return;
  }

  const sql = 'INSERT INTO usuario (username, password, confirmpassword, email, telefone) VALUES (?, md5(?), md5(?), ?, ?)';
  db.query(sql, [username, password, confirmpassword, email, telefone], (err, result) => {
    if (err) {
      console.error('Erro ao registrar o usuário: ' + err);
      res.send('Erro no registro. Tente novamente.');
    } else {
      // Gere um token de autenticação (substitua por um método seguro)
      const token = 'token_unico';

      // Envie um e-mail de autenticação com o token
      const mailOptions = {
        from: 'jgpretti2002@gmail.com',
        to: email,
        subject: 'Link de Autenticação',
        text: `Clique no link para autenticar ao portal D.A.S.A: http://localhost:3000/portaldentro.html/autenticar?token=${token}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Erro ao enviar e-mail: ' + error);
          res.status(500).send('Erro ao enviar e-mail.');
        } else {
          console.log('E-mail enviado: ' + info.response);
          res.status(200).send('Verifique seu e-mail para autenticação.');
        }
      });
    }
  });
});
// Configure o diretório onde seus arquivos HTML estão localizados
app.use(express.static(__dirname));

// Inicie o servidor na porta 3000
app.listen(port, () => {
  console.log(`Servidor web e servidor Node.js rodando na porta ${port}`);
});


// ---------------------------------------------------------------------------------------------------------

// Rota para a página de login
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

// Rota para processar o login
app.post('/processa_login', (req, res) => {
  const email = req.body.email;
  const senha = req.body.senha;

  if (!email || !senha) {
    res.send('Todos os campos devem ser preenchidos.');
    return;
  }

  // Verifique se o usuário existe no banco de dados
  const sql = 'SELECT * FROM usuario WHERE email = ? AND password = md5(?)';
  db.query(sql, [email, senha], (err, results) => {
    if (err) {
      console.error('Erro ao verificar o usuário: ' + err);
      res.send('Erro ao verificar o usuário. Tente novamente.');
    } else {
      if (results.length > 0) {
        console.log('Usuário conectou');
        // Se as credenciais estiverem corretas, crie uma sessão para o usuário
        req.session.user = email;
        res.redirect('/portaldentro.html'); // Redirecione para a página de painel após o login bem-sucedido
      } else {
        res.send('Login falhou. Verifique suas credenciais.');
      }
    }
  });
});


// Rota para a página de painel (após login)
app.get('/portaldentro.html', (req, res) => {
  // Verifique se o usuário está autenticado
  if (req.session.user) {
    // Se o usuário estiver autenticado, exiba o painel
    res.send('Bem-vindo ao painel do usuário!');
  } else {
    // Se não estiver autenticado, redirecione para a página de login
    res.redirect('/login');
  }
});

// Configure o diretório onde seus arquivos HTML estão localizados
app.use(express.static(__dirname));

// Inicie o servidor na porta 3000
// app.listen(port, () => {
//   console.log(`Servidor web e servidor Node.js rodando na porta ${port}`);
// });