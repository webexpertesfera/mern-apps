import clsx from "clsx";
import { t } from "i18next";
import toast from "react-hot-toast";
import { useUser } from "@/lib/auth";
import { Button } from "@/vibe/components";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TextareaAutosize } from "@mui/material";
import ContentWrapper from "../../Layout/ContentWrapper";
import { closeTicket } from "../../api/support/closeTicket";
import { useTicketDiscussion } from "@/features/manufacture/api/help-support/getTicketDiscussion";
import { postTicketDiscussion } from "@/features/manufacture/api/help-support/postTicketDiscussion";
import GearSpinner from "@/vibe/components/Spinner/GearSpinner";

export const ViewChat = () => {
  const { id } = useParams();
  const { data: user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [closeTicketload, setCloseTicketLoad] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const { data, refetch, isLoading, isFetching } = useTicketDiscussion({
    ticketId: id ?? "",
  });
  const loggedInUserRole = user?.roles[0]?.name;

  const sendMessage = async () => {
    try {
      setLoading(true);
      const payload = {
        help_support_ticket_id: id ?? "",
        message: message,
      };
      await postTicketDiscussion(payload);
      setMessage("");
      refetch();
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTicket = async () => {
    try {
      setCloseTicketLoad(true);
      await closeTicket(id ?? "");
      toast.success(t("close_ticket_success"));
      navigate('/admin/help-support')
    } finally {
      setCloseTicketLoad(false);
    }
  };

  const navStatus: {
    [key: string]: string;
  } = {
    CLOSED: "close-tag",
    RAISED: "raise-tag",
  };

  // useEffect(() => {
  //   const fetchConversation = setInterval(() => {
  //     refetch();
  //   }, 8000)
  //   return () => clearInterval(fetchConversation)
  // }, [])

  return (
    <ContentWrapper title={t("ticket_conversation")}>
      <div className="main-content">
        <div className="top-titlebar d-flex flex-row align-items-center justify-content-between mt-3">
          <div>
            <h3 className="f-20 bold title-main">{t("ticket_conversation")}</h3>
            <p className="f-14">
              Lorem ipsum dolor sit amet consectetur, adipisicing.
            </p>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <span
              className={clsx(
                "f-18 bold",
                navStatus[data?.ticket_status ?? ""]
              )}
            >
              {data?.ticket_status}
            </span>

            {data?.ticket_status !== "CLOSED" && (
              <div className="close-btn">
                <Button
                  size="lg"
                  loading={closeTicketload}
                  kind={Button.kinds.TERTIARY}
                  onClick={handleCloseTicket}
                >
                  {t("Closed")}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="white-card add-users new-product-card mt-3 help-center-back">
          {isLoading || isFetching ? (
            <GearSpinner />
          ) : (
            <>
              {data?.data?.length === 0 ? (
                <center className="d-flex align-items-center justify-content-center flex-column help-center-back">
                  <h4 className="help-text">{t("no_previous_found")}</h4>
                </center>
              ) : (
                data &&
                data?.data?.map((item, index) => {
                  const currentRole = item?.user?.roles[0]?.name;
                  const isSameUser = currentRole === loggedInUserRole;
                  return (
                    <div
                      key={index}
                      className={isSameUser ? "order-receiver" : ""}
                    >
                      <div className="order-changed relative d-flex flex-row gap-2 mt-4">
                        <span className="order-sts-bg relative d-block">
                          {item?.message}{" "}
                        </span>
                      </div>
                      <span className="gray f-13 order-time">
                        {item?.created_at}
                      </span>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
        {data?.ticket_status !== "CLOSED" && (
          <div className="add-users new-product-card mt-3 px-0">
            <div className="form-group border-text d-flex align-items-center justify-content-end">
              <TextareaAutosize
                minRows={2}
                value={message}
                className="help-area"
                placeholder={t("type_message")}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button
                loading={loading}
                className="mx-3"
                size="lg"
                onClick={sendMessage}
              >
                {t("send")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </ContentWrapper>
  );
};
