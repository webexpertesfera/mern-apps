import { useParams } from "react-router-dom";
import ContentWrapper from "../../Layout/ContentWrapper";
import { t } from "i18next";
import moment from "moment";
import GearSpinner from "@/vibe/components/Spinner/GearSpinner";
import { useTicketQuery } from "@/features/manufacture/api/help-support/getTicketQuery";

export const ViewQuery = () => {
  const { id } = useParams();
  const { data, isLoading, isFetching } = useTicketQuery({ ticketId: id ?? "" });
  return (
    <ContentWrapper title={t("view_query")}>
      <div>
        <p className="top-titlebar pb-3 d-flex flex-row align-items-center">
          <div className="heading">
            <h2 className="f-20 bold title-main">{t("view_query_details")}</h2>
            <p className="f-14">{t("update_customer_text")}</p>
          </div>
        </p>
        <div className="col-12 col-md-12 mt-2">
          {isLoading || isFetching ? (
            <GearSpinner />
          ) : (
            <div className="cat-view-req">
              <div className="payment-details-container faq-box bg-transparent p-0">
                <div className="row  pt-3">
                  <div className="col-12 col-md-8">
                    <div className="view-faq-log">
                      <label className="bold">{t("Title")}:</label>
                      <p className="f-14">
                        <span className="req">{data?.title}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="row pt-3">
                  <div className="col-12 col-md-8">
                    <div className="view-faq-log">
                      <label className="bold">{t("query")}:</label>
                      <p className="f-14">
                        <span className="req">{data?.query}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="row pt-3">
                  <div className="col-12 col-md-8">
                    <div className="view-faq-log">
                      <label className="bold">Date:</label>
                      <p className="f-14">
                        <span className="req">
                          {moment(data?.created_at)?.format("DD MMMM YYYY")}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ContentWrapper>
  );
};
