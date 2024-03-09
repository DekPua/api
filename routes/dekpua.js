const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const database = require("../database");

const getAccountType = {
  status: "getStatus",
  account: "GetAccount",
};

const ActivateType = {
  Active: "Active",
  inActive: "inActive",
  Banned: "Banned",
};

const OtpStatusType = {
  WaitForVerify: "wait_for_verify",
  Success: "success",
  Fail: "verify_fail",
};

const VoiceChannelStatusType = {
  Active: "Active",
  inActive: "inActive",
  Deleted: "Deleted"
}

async function newAutoVoiceChannel(channel, owner, permissions, online) {
  return new Promise((resolve, reject) => {
    database.query("INSERT INTO `auto_voicechannel`(`channel_id`, `channel_name`, `channel_type`, `owner_id`, `owner_username`, `permissions`, `online`, `updated_at`, `status`) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, \'Active\')", [channel.id, channel.name, channel.type, owner.id, owner.username, permissions, online], (err, results) => {
      if (err) {
        console.error('Error executing MySQL query:', err);
        reject(err);
      } else {
        resolve(results);
      }
    })
  });
};

async function getVoiceChannel(channelId) {
  if (channelId) {
    return new Promise((resolve, reject) => {
      database.query('SELECT * FROM `auto_voicechannel` WHERE `channel_id` = ? AND `status` = \'Active\'', [channelId], (err, results) => {
        if (err) {
          console.error('Error executing MySQL query:', err);
          reject(err);
        } else {
          if (results.length === 0) {
            resolve([]);
          } else {
            resolve(results);
          }
        }
      });
    });
  } else {
    return new Promise((resolve, reject) => {
      database.query('SELECT * FROM auto_voicechannel WHERE `status` = \'Active\'', [], (err, results) => {
        if (err) {
          console.error('Error executing MySQL query:', err);
          reject(err);
        } else {
          if (results.length === 0) {
            resolve([]);
          } else {
            resolve(results);
          }
        }
      });
    });
  }
};

async function deleteVoiceChannel(channelId) {
  return new Promise((resolve, reject) => {
      database.query("UPDATE `auto_voicechannel` SET `status`= \'Deleted\', `online`= 0, `updated_at`= CURRENT_TIMESTAMP WHERE `channel_id`= ?", [channelId], (err, results) => {
          if (err) {
              console.error('Error executing MySQL query:', err);
              reject(err);
          } else {
              resolve(results);
          }
      })
  });
};

async function updateVoiceChannel(channel, owner, permissions, online, status) {
  return new Promise((resolve, reject) => {
    database.query("UPDATE `auto_voicechannel` SET `status`= ?,`channel_name`= ?,`channel_type`= ?,`owner_id`= ?,`owner_username`= ?,`permissions`= ?,`online`= ?,`updated_at`=CURRENT_TIMESTAMP WHERE `channel_id`= ?", [status, channel.name, channel.type, owner.id, owner.username, permissions, online, channel.id], (err, results) => {
        if (err) {
            console.error('Error executing MySQL query:', err);
            reject(err);
        } else {
            resolve(results);
        }
    })
});
}

async function getAccount(discordId, email, type) {
  if (type == getAccountType.status) {
    if (discordId && email) {
      return new Promise((resolve, reject) => {
        database.query(
          "SELECT * FROM `account` WHERE `discord_id` = ? AND `email` = ?",
          [discordId, email],
          (err, results) => {
            if (err) {
              console.error("Error executing MySQL query:", err);
              reject(err);
            } else {
              if (results.length === 0) {
                resolve(null);
              } else {
                resolve(results[0]);
              }
            }
          }
        );
      });
    } else if (discordId) {
      return new Promise((resolve, reject) => {
        database.query(
          "SELECT * FROM `account` WHERE `discord_id` = ?",
          [discordId],
          (err, results) => {
            if (err) {
              console.error("Error executing MySQL query:", err);
              reject(err);
            } else {
              if (results.length === 0) {
                resolve(null);
              } else {
                resolve(results[0]);
              }
            }
          }
        );
      });
    } else if (email) {
      return new Promise((resolve, reject) => {
        database.query(
          "SELECT * FROM `account` WHERE `email` = ?",
          [email],
          (err, results) => {
            if (err) {
              console.error("Error executing MySQL query:", err);
              reject(err);
            } else {
              if (results.length === 0) {
                resolve(null);
              } else {
                resolve(results[0]);
              }
            }
          }
        );
      });
    }
  } else if (type === getAccountType.account) {
    if (discordId && email) {
      return new Promise((resolve, reject) => {
        database.query(
          "SELECT * FROM `account` WHERE `discord_id` = ? AND `email` = ? AND `activate` = ?",
          [discordId, email, ActivateType.Active],
          (err, results) => {
            if (err) {
              console.error("Error executing MySQL query:", err);
              reject(err);
            } else {
              if (results.length === 0) {
                resolve(null);
              } else {
                resolve(results[0]);
              }
            }
          }
        );
      });
    } else if (discordId) {
      return new Promise((resolve, reject) => {
        database.query(
          "SELECT * FROM `account` WHERE `discord_id` = ? AND `activate` = ?",
          [discordId, ActivateType.Active],
          (err, results) => {
            if (err) {
              console.error("Error executing MySQL query:", err);
              reject(err);
            } else {
              if (results.length === 0) {
                resolve(null);
              } else {
                resolve(results[0]);
              }
            }
          }
        );
      });
    } else if (email) {
      return new Promise((resolve, reject) => {
        database.query(
          "SELECT * FROM `account` WHERE `email` = ? AND `activate` = ?",
          [email, ActivateType.Active],
          (err, results) => {
            if (err) {
              console.error("Error executing MySQL query:", err);
              reject(err);
            } else {
              if (results.length === 0) {
                resolve(null);
              } else {
                resolve(results[0]);
              }
            }
          }
        );
      });
    }
  }
}

async function getOtp(discordId, ref) {
  return new Promise((resolve, reject) => {
    database.query(
      "SELECT * FROM `otp` WHERE `discord_id` = ? AND `ref` = ?",
      [discordId, ref],
      (err, results) => {
        if (err) {
          console.error("Error executing MySQL query:", err);
          reject(err);
        } else {
          if (results.length === 0) {
            resolve(null);
          } else {
            resolve(results[0]);
          }
        }
      }
    );
  });
}

async function updateAccountActivateStatus(discordId, email, activateStatus) {
  return new Promise((resolve, reject) => {
    database.query(
      "UPDATE `account` SET `activate`= ?, `updated_at` = CURRENT_TIMESTAMP WHERE `discord_id`= ? AND `email` = ?",
      [activateStatus, discordId, email],
      (err, results) => {
        if (err) {
          console.error("Error executing MySQL query:", err);
          reject(err);
        } else {
          resolve(results);
        }
      }
    );
  });
}

async function newAccount(discordId, email, activateStatus) {
  return new Promise((resolve, reject) => {
    database.query(
      "INSERT INTO `account`(`discord_id`, `email`, `activate`, `created_at`) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
      [discordId, email, activateStatus],
      (err, results) => {
        if (err) {
          console.error("Error executing MySQL query:", err);
          reject(err);
        } else {
          resolve(results);
        }
      }
    );
  });
}

async function newOtp(discordId, ref, email, Otp) {
  return new Promise((resolve, reject) => {
    database.query(
      "INSERT INTO `otp`(`discord_id`, `ref`, `email`, `otp`) VALUES (?, ?, ?, ?)",
      [discordId, ref, email, Otp],
      (err, results) => {
        if (err) {
          console.error("Error executing MySQL query:", err);
          reject(err);
        } else {
          resolve(results);
        }
      }
    );
  });
}

async function updateStatusOtp(discordId, email, ref, OtpStatus) {
  if (email) {
    return new Promise((resolve, reject) => {
      database.query(
        "UPDATE `otp` SET `verified`= ?, `updated_at` = CURRENT_TIMESTAMP WHERE `discord_id` = ? AND `email` = ? AND `ref` = ?",
        [OtpStatus, discordId, email, ref],
        (err, results) => {
          if (err) {
            console.error("Error executing MySQL query:", err);
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });
  } else {
    return new Promise((resolve, reject) => {
      database.query(
        "UPDATE `otp` SET `verified`= ?, `updated_at` = CURRENT_TIMESTAMP WHERE `discord_id` = ? AND `ref` = ?",
        [OtpStatus, discordId, ref],
        (err, results) => {
          if (err) {
            console.error("Error executing MySQL query:", err);
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });
  }
}

function sendEmail(emailTo, subject, text, html) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password or an app-specific password
    },
  });

  // Email options
  const mailOptions = {
    from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER}>`, // Sender address
    to: emailTo, // Recipient address
    subject: subject, // Subject line
    text: text, // Plain text body
    html: html, // HTML body
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return {
        status: 1,
        detail: error,
      };
    } else {
      return {
        status: 0,
        detail: info.response,
      };
    }
  });
}

function generateEmailOTP(otpLength = 6) {
  let otp = "";

  for (let i = 0; i < otpLength; i++) {
    otp += Math.floor(Math.random() * 10);
  }

  return otp;
}

function generateRandomString(length) {
  const characterPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characterPool.length);
    randomString += characterPool.charAt(randomIndex);
  }

  return randomString;
}

router.get("/", async (req, res) => [
  res.json({
    ok: true,
  }),
]);

router.post("/login", async (req, res) => {
  const { email, discordId } = req.body;

  if (!email)
    return res.status(400).json({ status: 1, message: "Invalid email" });
  if (!discordId)
    return res.status(400).json({ status: 2, message: "Invalid discordId" });

  const account = await getAccount(discordId, email, getAccountType.status);

  if (account) {
    await updateAccountActivateStatus(discordId, email, ActivateType.Active);

    return res.status(200).json({
      status: 0,
      message: `Activated ${discordId} with ${email}`,
      detail: {
        ref: null,
        email: email,
        discordId: discordId,
        activate: true,
      },
    });
  } else {
    const otp = generateEmailOTP();
    const ref = generateRandomString(6);

    sendEmail(
      email,
      `${otp} ยืนยันอีเมลล์ - Dek Pua Official`,
      `สวัสดี\nคุณได้ทำการยืนยันอีเมลล์ โดยรหัสยืนยันของคุณคือ ${otp}\nรหัสอ้างอิง : ${ref}\nDek Pua Official\nอีเมลนี้ถูกส่งด้วยระบบอัตโนมัติ กรุณาอย่าตอบกลับอีเมลนี้`,
      `สวัสดี<br>คุณได้ทำการยืนยันอีเมลล์ โดยรหัสยืนยันของคุณคือ <span>${otp}</span><br>รหัสอ้งอิง : ${ref}<br>Dek Pua Official<br>อีเมลนี้ถูกส่งด้วยระบบอัตโนมัติ กรุณาอย่าตอบกลับอีเมลนี้`
    );

    await newOtp(discordId, ref, email, otp);

    return res.status(201).json({
      status: 0,
      message: `Sending Email to ${email}`,
      detail: {
        ref: ref,
        email: email,
        discordId: discordId,
        activate: false,
      },
    });
  }
});

router.put('/logout', async (req, res) => {
  const { email, discordId } = req.body;

  if (!email) return res.status(400).json({ status: 1, message: "Invalid email" });
  if (!discordId) return res.status(400).json({ status: 2, message: "Invalid discordId" });

  const updateStatus = await updateAccountActivateStatus(discordId, email, ActivateType.inActive);

  if (!updateStatus) return res.status(500).json({ status: 3, message: "Internal Server Error" });

  return res.status(200).json({ status: 0, activate: false })
})

router.post("/login/otp", async (req, res) => {
  const { discordId, otp, ref } = req.body;

  if (!discordId)
    return res.status(400).json({ status: 1, message: "Invalid discordId" });
  if (!ref) return res.status(400).json({ status: 2, message: "Invalid ref" });
  if (!otp) return res.status(400).json({ status: 3, message: "Invalid otp" });

  const otpVerify = await getOtp(discordId, ref);

  if (!otpVerify || otpVerify.verified != OtpStatusType.WaitForVerify)
    return res.status(400).json({ status: 4, message: "Otp Expire" });

  if (
    otpVerify.otp == otp &&
    otpVerify.discord_id == discordId
  ) {
    let account = await getAccount(discordId, null, getAccountType.account);

    if (!account) {
      await newAccount(discordId, otpVerify.email, ActivateType.Active);
      account = await getAccount(discordId, null, getAccountType.account);
    }

    await updateStatusOtp(discordId, account.email, ref, OtpStatusType.Success);

    return res.status(200).json({ verify: true });
  } else {
    await updateStatusOtp(discordId, null, ref, OtpStatusType.Fail);

    return res.status(401).json({ verify: false });
  }
});

router.get("/profile", async (req, res) => {
  const { discordId } = req.query;

  if (!discordId)
    return res.status(400).json({ status: 1, message: "Invalid discordId" });

  const account = await getAccount(discordId, null, getAccountType.account);

  if (!account)
    return res.status(200).json({
      status: 2,
      activate: false,
      message: "Unactivate Account",
      account: { discordId: null, email: null },
    });

  return res
    .status(200)
    .json({
      status: 0,
      activate: true,
      message: "Activate Account",
      account: { discordId: account.discord_id, email: account.email },
    });
});

router.post('/voicechannel', async (req, res) => {
  const { channel, owner, permissions, online } = req.body;

  if (!channel) {
    return res.status(400).json({ status: 1, message: "Invalid channel" });
  } else if (!channel.id) {
    return res.status(400).json({ status: 2, message: "Invalid channel.id" });
  } else if (!channel.name) {
    return res.status(400).json({ status: 3, message: "Invalid channel.name" });
  } else if (!channel.type) {
    return res.status(400).json({ status: 4, message: "Invalid channel.type" });
  } else if (!owner) {
    return res.status(400).json({ status: 5, message: "Invalid owner" });
  } else if (!owner.id) {
    return res.status(400).json({ status: 6, message: "Invalid owner.id" });
  } else if (!owner.username) {
    return res.status(400).json({ status: 7, message: "Invalid owner.username" });
  } else if (!permissions) {
    return res.status(400).json({ status: 8, message: "Invalid permissions" });
  } else if (!online) {
    return res.status(400).json({ status: 9, message: "Invalid online" });
  }

  await newAutoVoiceChannel(channel, owner, JSON.stringify(permissions), online);

  res.json({ ok: true })
});

router.get('/voicechannel', async (req, res) => {
  const VoiceChats = await getVoiceChannel();

  const VoiceChannelList = []

  VoiceChats.forEach(VoiceChat => {
    const VoiceChannel = {
      channel: {
        id: VoiceChat.channel_id,
        type: VoiceChat.channel_type,
        name: VoiceChat.channel_name,
      },
      owner: {
        id: VoiceChat.owner_id,
        username: VoiceChat.owner_username,
      },
      permissions: VoiceChat.permissions,
      online: VoiceChat.online,
      created_at: VoiceChat.created_at,
    }

    VoiceChannelList.push(VoiceChannel);
  });

  return res.status(200).json(VoiceChannelList);
});

router.delete('/voicechannel', async (req, res) => {
  const { channelId } = req.body;

  if (!channelId) {
      return res.status(400).json({ status: 1, message: "Invalid channelId" });
  }

  const getInfo = await getVoiceChannel(channelId);
  const deleteStauts = await deleteVoiceChannel(channelId);

  if (getInfo && deleteStauts) {
      const Response = {
          status: 0,
          message: "Delete to database Success",
          detail: getInfo,
      };

      return res.status(201).json(Response);
  } else {
      return res.status(500).json({ status: 2, message: "Can't Delete data in database" })
  }
});

router.put('/voicechannel', async (req, res) => {
  const { channel, owner, permissions, online } = req.body;

  if (!channel) {
    return res.status(400).json({ status: 1, message: "Invalid channel" });
  } else if (!channel.id) {
    return res.status(400).json({ status: 2, message: "Invalid channel.id" });
  } else if (!channel.name) {
    return res.status(400).json({ status: 3, message: "Invalid channel.name" });
  } else if (!channel.type) {
    return res.status(400).json({ status: 4, message: "Invalid channel.type" });
  } else if (!owner) {
    return res.status(400).json({ status: 5, message: "Invalid owner" });
  } else if (!owner.id) {
    return res.status(400).json({ status: 6, message: "Invalid owner.id" });
  } else if (!owner.username) {
    return res.status(400).json({ status: 7, message: "Invalid owner.username" });
  } else if (!permissions) {
    return res.status(400).json({ status: 8, message: "Invalid permissions" });
  } else if (!online) {
    return res.status(400).json({ status: 9, message: "Invalid online" });
  }

  await updateVoiceChannel(channel, owner, JSON.stringify(permissions), online, VoiceChannelStatusType.Active);

  res.json({ ok: true })
});

module.exports = router;
